import React,  { useEffect, useState } from 'react'
import { ethers } from "ethers";
import './App.css'
import abi from "./utils/Feedback.json";

const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
  try {

    const ethereum = getEthereumObject();
    if(!ethereum) {
      console.error("Make sure you have Metamask");
      return null;
    }

    console.log("We have the Ethereum object", ethereum)
    const accounts =  await ethereum.request({method: "eth_accounts"});

    if (accounts.length !==0) {
      const account = accounts[0];
      console.log("found an authorized account: ", account)
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  
  } catch (error){
    console.error(error);
    return null
  }
};

function FeedbackForm() {

  const contractAddress = "0x5F165212A283d5999987dD947A515Fa1e3796F67"
  const contractABI = abi.abi
  const [currentAccount, setCurrentAccount ] = useState("");
  // Initialize state for feedback items
  const [feedbackItems, setFeedbackItems] = useState([]);
  // Initialize state for text field input
  const [feedbackInput, setFeedbackInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate the starting and ending index of the array to display
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;

  // Get the slice of the array to display based on the current page
  const displayedFeedback = feedbackItems.slice(startIndex, endIndex);

  // Function to handle going to the next page
  function handleNextPage() {
    setCurrentPage(currentPage + 1);
  }

  let feedbackCleaned = [];
  let updatedFeedback = [];

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const sendFeedback = async () => {
    setFeedbackInput('')

    if (feedbackInput.trim().length === 0 || feedbackInput.length < 5) {
      setErrorMessage('Please enter valid feedback with at least 5 characters');
      return;
    }
    try {
      const ethereum = getEthereumObject();
      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const feedbackContract = new ethers.Contract(contractAddress, contractABI, signer);
        const feedbackTxn = await feedbackContract.submitFeedback(feedbackInput);
        console.log("Mining...", feedbackTxn)
        await feedbackTxn.wait();
        console.log("Mined -- ", feedbackTxn.hash);
        setErrorMessage('');

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage('Error sending feedback. Please try again later.');
    }     

};

const getAllFeedback = async () => {
  try {
    const ethereum = getEthereumObject();
    if (ethereum) {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const feedbackContract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const feedbacks = await feedbackContract.getAllFeedback();
      console.log(feedbacks)

      feedbacks.forEach(({ user, timestamp, feedback }) => {
        feedbackCleaned.push({
          address: user,
          timestamp: new Date(Number(timestamp) * 1000),
          feedback: feedback
        });
      });

      for(let i = feedbackCleaned.length - 1; i >= 0; i--){
        updatedFeedback.push(feedbackCleaned[i]);
      }
      setFeedbackItems(updatedFeedback);
    } else {
      console.log("Ethereum object doesn't exist!")
    }
  } catch (error) {
    console.log(error);
  }
}

  // useEffect(()=> {
  //   if(currentAccount){
  //     getAllFeedback()
  //   }
  // }, [currentAccount])

  
    useEffect(() => {
    async function getAccount() {
      const account = await findMetaMaskAccount();
      if (account !== null) {
        setCurrentAccount(account);
        getAllFeedback();
      }
    }
    getAccount();
  }, []);

  return (
    <div>
      <header>
        <h1>Talk Your Own 😲</h1>
        <p>Welcome to Talk Your Own! This is a platform where you can talk as e dey do you.</p>
      </header>

      <section id="feedbackBody">
        <h2>Wetin You Won Yarn The Public???</h2>
        <div>
          <textarea 
            id="feedbackInput" 
            value={feedbackInput} 
            onChange={event => setFeedbackInput(event.target.value)} 
            onFocus={() => setErrorMessage('')} 
            rows="5" cols="60" 
            form="feedbackForm"> Enter your feedback here...
          </textarea>
          {currentAccount && ( <button 
                                    className="btn" 
                                    form="feedbackForm" 
                                    onClick={sendFeedback}
                                    > Submit Feedback
          </button> )} 
          {errorMessage && <div className="error">{errorMessage}</div>}

          {!currentAccount && ( <h4>Connect wallet to submit feedback</h4> )} 
          {!currentAccount && ( <button 
                                  className="btn" 
                                  onClick={connectWallet}> Connect Wallet </button> )} 
        </div>
      </section>
      
      <section>
        
        {currentAccount && (<h2>Wetin Oda Pipu Don Yarn 👀 </h2> )} 

        <div>
      {displayedFeedback.map((feedback, index) => {
        return (
          <div key={index} 
            style={{ backgroundColor: "#d5d4d4", 
                    marginTop: "16px", 
                    padding: "8px" }}>
            <div>
              User: {
              feedback.address.toString().slice(0, 2) + "*****" + feedback.address.toString().slice(37) } 
            </div>
            <div>Time: {feedback.timestamp.toString()}</div>
            <div>Message: {feedback.feedback}</div>
          </div>
        );
      })}
      {feedbackItems.length > endIndex && (
        <button onClick={handleNextPage}>View More 🤭</button>
      )}
    </div>
      </section>
      

      <footer>
        <p>© 2023 Made with ❤️‍🔥 by @amdonatusprince</p>
      </footer>
    </div>
  );
}

export default FeedbackForm;