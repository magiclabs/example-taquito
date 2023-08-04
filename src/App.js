import React, { useState, useEffect } from "react";
import { TezosToolkit } from '@taquito/taquito';
import { Magic } from "magic-sdk";
import { TaquitoExtension } from '@magic-ext/taquito'
import "./styles.css";

const magic = new Magic("pk_live_C20A087BDF08A859", {
    extensions: {
        taquito: new TaquitoExtension({
            rpcUrl: "https://ghostnet.tezos.marigold.dev"
        })
    }
});

export default function App() {
    const [email, setEmail] = useState("");
    const [publicAddress, setPublicAddress] = useState("");
    const [destinationAddress, setDestinationAddress] = useState("");
    const [sendXTZAmount, setSendXTZAmount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userMetadata, setUserMetadata] = useState({});
    const [sendingTransaction, setSendingTransaction] = useState(false);

    useEffect(() => {
        magic.user.isLoggedIn().then(async magicIsLoggedIn => {
            setIsLoggedIn(magicIsLoggedIn);
            if (magicIsLoggedIn) {
                const publicAddress = (await magic.taquito.getPublicKey()).pkh;
                setPublicAddress(publicAddress);
                setUserMetadata(await magic.user.getMetadata());
            }
        });
    }, [isLoggedIn]);

    const login = async () => {
        await magic.auth.loginWithMagicLink({ email });
        setIsLoggedIn(true);
    };

    const logout = async () => {
        await magic.user.logout();
        setIsLoggedIn(false);
    };

    const handleMagicSign = async () => {
        setSendingTransaction(true);
        const Tezos = new TezosToolkit('https://ghostnet.tezos.marigold.dev');
        const magicSigner = await magic.taquito.createMagicSigner();

        Tezos.setProvider({signer: magicSigner});

        const operation = await  Tezos.contract.transfer({ to: destinationAddress, amount: sendXTZAmount })

        setSendingTransaction(false);
        console.log('result', operation)
    }

    return (
        <div className="App">
            {!isLoggedIn ? (
                <div className="container">
                    <h1>Please sign up or login</h1>
                    <input
                        type="email"
                        name="email"
                        required="required"
                        placeholder="Enter your email"
                        onChange={event => {
                            setEmail(event.target.value);
                        }}
                    />
                    <button onClick={login}>Send</button>
                </div>
            ) : (
                <div>
                    <div className="container">
                        <h1>Current user: {userMetadata.email}</h1>
                        <button onClick={logout}>Logout</button>
                    </div>
                    <div className="container">
                        <h1>Tezos address</h1>
                        <div className="info">
                            {publicAddress}
                        </div>
                    </div>
                    <div className="container">
                        <h1>Send Transaction</h1>
                        {
                            sendingTransaction ?
                                <div>
                                    <div>
                                        Send transaction success
                                    </div>
                                </div>
                                :
                                <div/>
                        }
                        <input
                            type="text"
                            name="destination"
                            className="full-width"
                            required="required"
                            placeholder="Destination address"
                            onChange={event => {
                                setDestinationAddress(event.target.value);
                            }}
                        />
                        <input
                            type="text"
                            name="amount"
                            className="full-width"
                            required="required"
                            placeholder="Amount in XTZ"
                            onChange={event => {
                                setSendXTZAmount(event.target.value);
                            }}
                        />
                        <button id="btn-send-txn" onClick={handleMagicSign}>
                            Send Transaction
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
