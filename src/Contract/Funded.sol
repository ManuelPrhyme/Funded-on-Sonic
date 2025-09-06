// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract funded {

    //Contract deployers address constant
    address payable immutable Proprietor;

    constructor(){
        //Immutably designating the deployers address, and allowing for it to receive S from this contract
         Proprietor = payable(msg.sender);
    }

    //Restriction modifier for restricting access to certain function to just the deploing address
    modifier _proprietor(){
        require(msg.sender == Proprietor,"Unauthorized");
        _;
    }

    //ID generator factor. Fits into components on the front end to generate a unique ID for every project
    //It increments on every registration
    uint public idCounter = 1;

    //Counter of overall contributions on the platform
    uint public totalContribs;

    //This is the accrued total of 5% deductions from every campaign. Deployer should be at discretion to withdraw their revenue
    //regardless of the status of the project.
    uint public deployerRevenue;

    //For restricting the campaign statuses. Changes when Campaign owner withdraws their contributions
    enum Status {
        Closed,
        Active
    }
    
    // Data template for the structure of storing a project's information onchain
    struct campaignStruct {
        address ownersAddress;
        string title;
        string descr;
        string longDescr;
        string creatorName;
        uint goalAmount;
        string deadline;
        string image;
        string catogory;
        uint contributions;
        Status campaignStatus;
    }

    // Data structure for the contributor information
    struct contribStruct {
        address contribAddress;
        uint256 amount; 
    }

    //Data structure for recording all contributions, treacable by the project's ID
    //This critical to enable us to reimburse the correct amounts back to the contributors when the criteria is met
    mapping(uint => contribStruct[]) public Contributions;

    //This arrays stores active campaign IDs and enables us to simulate iteration on the mapping to retrieve all the campaigns
    uint[] public campaignIDs;

    //Record for Ended Campaigns
    uint[] public closedCampaignIDs;

    //The mapping stores all the campaigns created on the contract, separately, in an efficiently retrievable format on the front end
    mapping(uint  => campaignStruct ) public registeredCampaigns;

    //Utility function for calculating the 5% from all contributions of all campaigns
    function fivePercent(uint _contribution) private pure returns (uint){
            uint Percent = (5 * _contribution) / 100;
            return Percent;
    }

    //Utility function for shifting the campaign ID to the closed campaign array
    function Shifter(uint _ID) public {
        for(uint8 c = 0; c < campaignIDs.length; c++){
                    if(campaignIDs[c] == _ID){
                        for(uint8 cc = c; cc < campaignIDs.length-1; cc++ ){
                            campaignIDs[cc] = campaignIDs[cc+1];
                            if(cc == campaignIDs.length-2){
                                campaignIDs[cc+1];
                                campaignIDs.pop();
                                closedCampaignIDs.push(_ID);
                                break;
                            }
                        }
                    }
                    else {
                        continue ;
                    }
                 }
    }

    //Campaign registration function. 
    function registerCampaign(
        string memory _title,
        string memory _descr,
        string memory _longDescr,
        string memory _creatorName,
        uint _goalAmount,
        string memory _deadline,
        string memory _img,
        string memory _category       
        
    ) external payable {
        //The creator is required to make the very first contribution to their project with 0.0005 S, for the project to be registered
        //Just to express commitment (Elimination Criteria)
        require(msg.value == 5e15,"Registration failed");

        // set the ID of the campaign to the current value of idCounter and then increment it
        uint _ID =  idCounter;
        
        //Updating general contributions sum
        totalContribs += msg.value;

        //Updating the proprietor's general revenue;
        deployerRevenue += fivePercent(msg.value);

        //All state variables are then polulated with the new campaign data as specified
        registeredCampaigns[_ID] = campaignStruct(
            msg.sender,
            _title,
            _descr,
            _longDescr,
            _creatorName,
            _goalAmount,
            _deadline,
            _img,
            _category,
            msg.value,
            Status.Active
        );

        //Updating the contributors mapping with the campaign owner's contribution on their own project
        Contributions[_ID].push(contribStruct(msg.sender,msg.value));

        //registering the event ID
        campaignIDs.push(_ID);
        
        //Incrementing the Counter to guide in tracking the campaigns by index (Next registered Campaign will have higher value)
        idCounter = idCounter + 1;

    }

    //Contributors call this function contribute to a specific project
    function contribute(uint _ID) external payable{

        //Checking if the project is still active
        require(registeredCampaigns[_ID].campaignStatus == Status.Active,"Project Ended");
        
        //Updating the record of the contributions of a particular project with the latest contribution
        registeredCampaigns[_ID].contributions += msg.value;

        //Updating the Contributors record with the new contribution (The contriubution is shown in its entiretly to preserve transparency)
        Contributions[_ID].push(contribStruct(msg.sender,msg.value));
        
        //Updating the proprietor's revenue (5% of the contribution)
        deployerRevenue += fivePercent(msg.value);

        //Update the totalContributions
        totalContribs += msg.value;

    }

    //Campaign Owner withdraws the funds when the conditions are met (Goal is reached in time)
    function withdrawCampaignFunds(uint _ID, bool _Status) external {

        //Check if project wasn't already ended with the "End" method. This is to avoid double spending
        // since duirng the "End" transaction, there is redistribution of a failed project's funds, so the 
        //owner of that project shouldn't be able to withdraw any funds, regardless of where other conditions are true
        require(registeredCampaigns[_ID].campaignStatus == Status.Active,"Project Ended");

        //Validating and restricting transaction request to only the project's Owner
        require(registeredCampaigns[_ID].ownersAddress == msg.sender,"Withdraw not authorized");

        //Local variable to store the Campaign Owners Address for convenient reusability, and making able to receive Eth from this contract
        address payable rewardAddress = payable(registeredCampaigns[_ID].ownersAddress);

        //Checking if the Front end authorized the contract to accept withdraws from the contract
        require(_Status,"Withdraw not allowed");

        //Calculating the net amount the campaign Owner is allowed to withdraw (95%)
        uint netWithdrawAmount =  registeredCampaigns[_ID].contributions - fivePercent(registeredCampaigns[_ID].contributions);

        //Sending Contributions to the registered address
        (bool sendStatus,) = rewardAddress.call{value:netWithdrawAmount}("");

        //Updating state based to the result of the previous transaction (Shifting the ID from the active campains Array to the closed -
        //campaigs Array
        if(sendStatus == true) {
                registeredCampaigns[_ID].campaignStatus = Status.Closed;
                
                //Shifting the ID. (Because Solidity can only remove an array element at the end, we have to move the ID to the end of the array
                //to be pop it from the array) first, then push it to the closed campaigns array
                Shifter(_ID);
        }

    }

    //Contributions are sent back to the contributors if the conditions are met (Period elapses before threshold is reached)
    function reimburse(uint _ID) private  _proprietor{
        
        contribStruct[] memory Contributors = Contributions[_ID];

        //Loop through the array of contributors to make the gas compesation deduction the reimburse them
        for(uint16 c = 0; c < Contributors.length; c++) {

            //Obtaining each contributor's correct information, to reimburse them accurately
            address addressToReimburse = Contributors[c].contribAddress;
            uint grossAmountToReimburse = Contributors[c].amount;

            // (getting the 1% deduction of the amount to transact)
            uint deduction = grossAmountToReimburse / 100;

            //Getting the net amount to send to a particular address
            uint netAmountToReimburse = grossAmountToReimburse - deduction;

            //Sending S back to the contributor
            (bool sendStatus,) = addressToReimburse.call{value:netAmountToReimburse}("");

             //Adding 1% to the 'deployersRevenue', to unlock it for the Proprietor
            deployerRevenue += deduction;
        }

    }

    function end(bool _contribStatus, uint _ID) external _proprietor {

         //Check if project wasn't already ended with the "Withdraw" method. This is to avoid double spending
        // since duirng the "Withdraw" transaction, contributed funds are sent to the campaign owners address
        require(registeredCampaigns[_ID].campaignStatus == Status.Active,"Project Ended");

        //Check if the Frontend evaluated that the particular project is due for ending (The time has passed and it didnt achieve its threshold)
        require(_contribStatus == true,"Project is still viable");

        //Updating its status
        registeredCampaigns[_ID].campaignStatus = Status.Closed;

        //Shifting its ID to the closed Campaigns Array
        Shifter(_ID);

        //Refunding the contributors
        reimburse(_ID);

    }

    function proprietorWithdraw(uint _withdrawAmount) external _proprietor {
        //Checking the owner has the right to withdraw the requested amount from the contract. If they dont, the transaction will revert
        require(_withdrawAmount <= deployerRevenue && deployerRevenue > 0,"Value out or range (0 or Greater than balance)");
        
        //Sending S to proprirtor's address 
        (bool sendStatus,) =  Proprietor.call{value: _withdrawAmount}("");

        //Updating deployer revenue balance on teh contract
        if(sendStatus == true){
            deployerRevenue = deployerRevenue - _withdrawAmount;
        }
        
    }

    //Preliminary information required to update the inteface and provide information required to calculations on the frontend
    function Preliminaries() external view returns(uint256,uint256,address,uint[] memory,uint[] memory){
        return (idCounter,totalContribs,Proprietor,campaignIDs,closedCampaignIDs);
    }

    //Retrieval function for information regarding a particular campaign
    function getCampaign(uint _ID) external view returns(campaignStruct memory, contribStruct[] memory){
        return (registeredCampaigns[_ID],Contributions[_ID]);
    }

}