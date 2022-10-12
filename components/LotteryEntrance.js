import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {

    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    console.log(chainId)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const dispatch = useNotification()

    const [entranceFee, setEntranceFee] = useState('')
    const [recentWinner, setRecentWinner] = useState('')
    const [numberOfPlayers, setNumberOfPlayers] = useState('')

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi, 
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        setEntranceFee(entranceFeeFromCall)
        const recentWinner = (await getRecentWinner()).toString()
        setRecentWinner(recentWinner)
        const numOfPlayers = (await getNumberOfPlayers()).toString()
        setNumberOfPlayers(numOfPlayers)
    }

    useEffect(() => {
        if(isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function(tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function() {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Transaction Notification",
            position: "topR",
        })
    }

    return (
        <div>
            {raffleAddress ? (
                <div>
                    <button onClick={async function(){await enterRaffle({
                        onSuccess: handleSuccess,
                        onError: (error) => console.log(error)
                    })}}>Enter Raffle</button>
                    <p>Entrance Fee : {parseInt(entranceFee) / 10**18} Eth</p>
                    <p>Number of players : {numberOfPlayers}</p>
                    <p>Recent Winner : {recentWinner}</p>
                </div>
            )  : (
                <div>No Raffle address Detected</div> 
            )}
            
        </div>
    )
}