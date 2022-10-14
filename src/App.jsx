import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import hourglass from "./assets/Spinner.gif"

import "98.css";
import Draggable from 'react-draggable'

function App() {
  //spotify link
  const spotifyLink = "https://open.spotify.com/embed/track/"
   //variable that holds the contract address after you deploy
  const contractAddress = "0xfFC7E8335588Bb21938F97Bd3b76A7539E5Bd6E7";
   //Create a variable here that references the abi content!
  const contractABI = abi;
  //state variable we use to store our user's public wallet.
  const [currentAccount, setCurrentAccount] = useState("");
  //All state property to store all waves
  const [allWaves, setAllWaves] = useState([]);
  //All state property to count total waves 
  const [waveCount, setWaveCount] = useState("");
  //text box variable
  const [messageValue, setMessageValue] = useState("");
  //loading spinner
  const [loading, setLoading] = useState(false);
  

  /*WALLET STUFF */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      //checking and then changing the network if not on Rinkby - REMEBER TO UPDATE WHEN NETWORK CHANGED
    const chainId = await ethereum.request({ method: 'eth_chainId' });    
    console.log("Current network", chainId);
    //check which network the wallet is connected on 
    if(chainId != 5){
      alert("90s Nostalgia Portal uses Goerli! You need to switch network if you want to see the music");
    };
     // request to switch the network to rinkeby if not on it
     const tx = await ethereum.request({method: 'wallet_switchEthereumChain', params:[{chainId: 
      '0x5'}]}).catch()
      if (tx) {
        console.log(tx)
      }
    /*Metamask stuff */
    //Check if we're authorized to access the user's wallet with eth_account 
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /** Implement connectWallet method */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("You'll need Metamask to get involved");
        return;
      }      
       //checking AGAIN and then changing the network if not on Rinkby - REMEBER TO UPDATE WHEN NETWORK CHANGED
    const chainId = await ethereum.request({ method: 'eth_chainId' });    
    console.log("Current network", chainId);
    //check which network the wallet is connected on 
    if(chainId != 5){
      alert("90s Nostalgia Portal uses Goerli! You need to switch network if you want to see the music");
    };
     // request to switch the network to rinkeby if not on it
     const tx = await ethereum.request({method: 'wallet_switchEthereumChain', params:[{chainId: 
      '0x5'}]}).catch()
      if (tx) {
        console.log(tx)
      }
  //literally asking Metamask to give me access to the user's wallet with eth requestAccounts
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  };

  const disconnectWallet = () => {
    setCurrentAccount("");
  };

 /* FUNCTION TIME */
 
 //Calling getTotalWaves from contract and setting a send wave. Not sure why need getTotalWaves called twice in this thing but the counter doesnt work otherwise and 2 songs are shown in the array instead of 1. ffs. 
  
const wave = async () => {
  if (messageValue.length >= 73 && messageValue.includes('spotify.com')) {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        )

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total song count...', count.toNumber())
        setLoading(true)

        //Execute the actual wave from your smart contract
        const waveTxn = await wavePortalContract.wave(messageValue)
        console.log('Mining...', waveTxn.hash)

        await waveTxn.wait()
        console.log('Mined -- ', waveTxn.hash)

        count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total song count...', count.toNumber())
        alert('All done. Thank you for sending a song!')
        setWaveCount(count.toNumber())
        setLoading(false)
        setMessageValue("")
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  } else {
    console.log("That's not a spotify URL")
    alert("That's not a Spotify URL, try again.");
  }
}
  
   //Calling GetAllWaves from contract to show list of waves
  const getAllWaves = async () => {
   const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = ethers.getDefaultProvider("goerli");
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);
        //Call the getAllWaves method from your Smart Contract
        const waves = await wavePortalContract.getAllWaves();
        console.log("got waves lets surf")
        //Only need address and message in our UI so let's pick those out
      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

      setAllWaves(wavesCleaned);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};

  //THIS FUCTION WORKS TO SPLIT STRING!

 function func () {
	// Original string
    let str = urlInput.value
    // Splitting up to 2 terms
    let array = str.split(".com/");
    let joined = array[0]+".com/embed/"+array[1];
    setMessageValue(joined);
    console.log("function happened", joined)
}
  
    useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

   /*/Emitted events (from contract) listener
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (message) => {
    console.log("NewWave", message);
    setAllWaves(prevState => [
      ...prevState,
      {
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);*/
    

useEffect(() => {
  let wavePortalContract;

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", async  function () 
    {getAllWaves()}
    );
  }

}, []);
  
     
  useEffect(() => {
    getAllWaves();
  }, [])

  
  //Function to call the total number of waves
  const getWaveCount = async () => {
    try {
      const provider = ethers.getDefaultProvider("goerli");
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);
      //Gets total songs minted from the smart contract
     let count = await wavePortalContract.getTotalWaves();
      //updates the state
      setWaveCount(count.toNumber());
      console.log("how many waves?")
   }
   catch(error){
     console.log('UseEffect to see TOTAL WAVES try switching to goerli maybe', error)}
 }

  useEffect(() => {
    getWaveCount()
  }, [getWaveCount]);

  



 
   ///////////////////////////////
  //// RETURN///////////////////
  /////////////////////////////
  return (
    <main>
      
      {/* MOBILE SCREEN ONLY CONTENT IN THIS DIV */}
<div className="alertmessage">
  <div className="window">
  <div className="title-bar">
    <div className="title-bar-text">90s Nostalgia Portal</div>
  </div>
  <div className="window-body">
    <img src="https://i.imgur.com/AwI7EDk.png" alt="" />
  <p>In the spirit of Windows 98, 90s Nostalgia Portal isn't optimised for mobile screens yet. </p>
    <p>Please come back in 20 years or checkout the desktop version.</p>
  </div>
    <section className="field-row" style={{"justify-content" : "flex-end"}}>
          <button>OK</button>
          <a href="https://youtu.be/OlD642mWrhM" target="_blank"><button>Not OK</button></a>
        </section>
</div>
</div> {/* END MOBILE SCREEN ONLY CONTENT */}
      
<div id="desktop">
<div className='row'>
{/* COLUMN 1 */}
<div className="column left">
  {/* BACKGROUND NOTHINGY ICONS */}
  <div className="desktop-icons">
    <div className="desktop-icon my-computer" title="My Computer">
      My Computer
    </div>
    <div className="desktop-icon my-documents" title="My Documents">
      My Documents
    </div>   
     <div className="desktop-icon network" title="Network Neighborhood">
      Network Neighborhood
    </div>
    </div>
{/* END BACKGROUND NOTHINGY ICONS */}
  </div>{/* this div ends column 1*/}

  <div className="column middle">
    {/* COLUMN 2 */}
    {/* NOTEPAD */}
    <div className='notes'>
  <div className="window" style={{"position" : "absolute", "width" : "42vw"}}>
  <div className="title-bar">
    <div className="title-bar-text">Notepad</div>
    <div className="title-bar-controls">
      <button aria-label="Minimize"></button>
      <button aria-label="Maximize"></button>
      <button aria-label="Close"></button>
    </div>
  </div>
  <div className="window-body" style={{"margin" : "0px"}}>
    <ul className="menubar">
    <li><u>F</u>ile</li>
    <li><u>E</u>dit</li>
    <li><u>S</u>earch</li>
    <li><u>H</u>elp</li>
    </ul>
    <div className="card-body">
      <h3>Hello! Welcome to my 90s Nostalgia Portal!</h3>
       { !loading ? (<h4>Please send me your favourite 90's era tunes, on the blockchain :)</h4>) : (<h3><img src={hourglass} />Minting please wait...</h3>) }
      <h5>HOW TO USE: </h5>
      <ul>
      <li>Connect with Metamask, on the GOERLI network.</li>
      <li>Copy a song link from Spotify and paste it over in the box on the WINAMP simulator.</li> 
      <li>Click 'submit' to add it to the playlist and be in with a (randomish) chance to win some (Goerli) Eth!</li>
      <li>Watch the counter go up every time a song is submitted, and enjoy the tuuuunes.</li>
      </ul>
      <p>Frontend Web3 gets compared to Web1 so here's a throwback to remind us just how far we've come.</p>
      <p>If you're old enough to remember, old enough to have forgotten or you never got the chance to experience Windows 98.</p>
      <p>It was the dial up broadband era, you had to choose between a phone call or being online. Browser wars between Netscape and Internet Explorer were starting to heat up (look how far we've come!) and the first iPhone wasn't to be unveiled for almost another decade! Still, I got banned from Ebay in around 1999 for putting a twiglet up for sale - so spam management was doing well.</p>
    </div>
  </div>
 </div>
</div>
{/* END NOTEPAD */}

    
    {/* CONNECT WALLET BOX */}
    <Draggable>
    <div className='walletconnect'>
 <div className="window" style={{"width" : "260px"}} >
      <div className="title-bar">
        <div className="title-bar-text">Wallet Connect 2.0</div>
        <div className="title-bar-controls">
          <button aria-label="Help"></button>
        </div>
      </div>
      <div className="window-body">
        <h5>(Tip: You can move me anywhere!)</h5>
      {/* show wallet connection status and address*/}
        {currentAccount ? <p> Woohoo your Metamask is connected!</p> : <p>Please connect with Metamask to view the playlist and submit a link</p> }
          {currentAccount ? <p> Account: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}<button style={{"margin" : "10px"}} onClick={disconnectWallet}>Disconnect</button></p> : <section className="field-row" style={{"justify-content" : "flex-end"}}><button onClick={connectWallet}>Connect</button>
          <a href="https://metamask.io/" target="_blank"><button>Huh?</button></a></section>}
      </div>
    </div>
   </div>
    </Draggable>
{/* END CONNECT WALLET BOX */}
    </div> {/* this div ends column 2 (middle) */} 

  {/* COLUMN 3 */}
  <div className="column right">
    {/* MEDIA PLAYER! */}
<div className='mediaplayer'>    
<div className='winamp'>
		<div className='header'>&nbsp;</div>
		<div className='player'>
			<div className='vis'> 00:00[{waveCount}]</div>
			<div className='vis title'><marquee>lovely lemons playlist...Total songs [{waveCount}]</marquee></div>
			<div className='inf'></div>
			<div className='inf khz'></div>
			<div className='mono_stereo'>mono</div>
			<div className='bar volume'></div>
			<div className='bar blanced'></div>
			<div className="btn ext left">EQ</div>
			<div className="btn ext">PL</div> 
      <div className='sidebar'></div>
      {/* Submitting spotify link function called here! */}
      <div className='submit'>
      <input className="add-music-input" 
             placeholder="Paste Spotify URL Here. 90's songs only pls." 
             name="url"
             type="url"
             id="urlInput"
             value={messageValue}
             onChange={func}
             />
    {currentAccount ? <button className='pbutton' onClick={wave}>Submit</button> : <button className='pbutton'>⏏</button>}
       {/* Submitting spotify link function done */}
        <button className='pbutton'>►</button><button className='pbutton'>||</button><button className='pbutton'>&#9632;</button> 
        </div>
      </div>
   
    <div className='header spotify'>&nbsp;</div>
		<div className='player spotify'>
      {/* SONGS */}
          <div>
            {allWaves.map((wave, index) => {
          return (
            <div key={index}>
           <div><iframe src="https://open.spotify.com" loading="lazy" className="iframe" src={wave.message} width="300" height="80" allowtransparency="true" allow="encrypted-media"></iframe></div>
            </div>)
        })}
          </div>
      {/* END SONGS  */}
        </div>
    </div>
  </div>
{/* END MEDIA PLAYER */}
    </div> {/* this div ends column 3 and thus ENDDING THE COLUMNS */}
 
  
  </div>{/* div to end colums and row do not remove */} 
   </div>      {/*  CLOSING DIV FOR DESKTOP DO NOT REMOVE */}


{/* START BUTTON BOTTOM TOOLBAR */} 
<div className="startbar">      
  <div id="toolbar">
    <div className="toolbar-start-menu">
      <button className="start-button">
        Start
      </button>
       </div>
 
    
    <div className="toolbar-separator"></div>
 
    <div className="toolbar-left">
      <label className="toolbar-icon ie"></label>
      <label className="toolbar-icon outlook"></label>
      <label className="toolbar-icon desktop"></label>
    </div>
    
    <div className="toolbar-separator"></div>

        <a href="https://faucets.chain.link/rinkeby" target="_blank"><button className="rink" style={{"margin" : "5px"}}>Need Rinkeby? 💰</button></a>

    <div className="toolbar-right">
      <div className='time'>🍋 16 May 1998</div>
    </div>
  </div>
</div>  
{/* END START BUTTON BOTTOM TOOLBAR */} 

    </main>
    
  );
}

export default App;
