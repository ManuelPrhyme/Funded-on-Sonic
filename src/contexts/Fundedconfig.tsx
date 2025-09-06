export const FundedAddress = "0x45D62B999cc8c631bD7CbD7AAaC109840A52Af6D"


 export const FundedABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "Contributions",
      "outputs": [
        {
          "internalType": "address",
          "name": "contribAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "Preliminaries",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_ID",
          "type": "uint256"
        }
      ],
      "name": "Shifter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "campaignIDs",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "closedCampaignIDs",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_ID",
          "type": "uint256"
        }
      ],
      "name": "contribute",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "deployerRevenue",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "_contribStatus",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "_ID",
          "type": "uint256"
        }
      ],
      "name": "end",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_ID",
          "type": "uint256"
        }
      ],
      "name": "getCampaign",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "ownersAddress",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "descr",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "longDescr",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "creatorName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "goalAmount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "deadline",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "image",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "catogory",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "contributions",
              "type": "uint256"
            },
            {
              "internalType": "enum Funded.Status",
              "name": "campaignStatus",
              "type": "uint8"
            }
          ],
          "internalType": "struct Funded.campaignStruct",
          "name": "",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "contribAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "internalType": "struct Funded.contribStruct[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "idCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_withdrawAmount",
          "type": "uint256"
        }
      ],
      "name": "proprietorWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_descr",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_longDescr",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_creatorName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_goalAmount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_deadline",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_img",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_category",
          "type": "string"
        }
      ],
      "name": "registerCampaign",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "registeredCampaigns",
      "outputs": [
        {
          "internalType": "address",
          "name": "ownersAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "descr",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "longDescr",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "creatorName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "goalAmount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "deadline",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "image",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "catogory",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "contributions",
          "type": "uint256"
        },
        {
          "internalType": "enum Funded.Status",
          "name": "campaignStatus",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalContribs",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_ID",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "_Status",
          "type": "bool"
        }
      ],
      "name": "withdrawCampaignFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]