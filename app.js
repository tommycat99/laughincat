document.addEventListener("DOMContentLoaded", function () {
    const catImage = document.getElementById("catImage");
    const laughSound = document.getElementById("laughSound");
    const startButton = document.getElementById("startButton");
    const tradeLog = document.getElementById("tradeLog");
    const marketCapElement = document.getElementById("marketCap");

    let trades = [];
    let ws = null;

    laughSound.volume = 0.5; // Set sound volume to 50%

    startButton.addEventListener("click", function () {
        // Connect to the WebSocket
        ws = new WebSocket('wss://pumpportal.fun/api/data');

        ws.onopen = function () {
            console.log("Connected to WebSocket");

            // Hide start button after connecting
            startButton.style.display = 'none';

            // Subscribing to trades on a specific token
            const payload = {
                method: "subscribeTokenTrade",
                keys: ["3qz2i8PLtRZGW339EYkKrkAcfBT2CYR8kfqAZrkypump"] // array of token CAs to watch
            };
            ws.send(JSON.stringify(payload));
        };

        ws.onmessage = function (event) {
            const data = JSON.parse(event.data);
            console.log("Trade data received:", data);

            // Update market cap
            marketCapElement.textContent = `Market Cap (SOL): ${data.marketCapSol.toFixed(2)}`;

            // Check if the trade event is a buy
            if (data.txType === "buy") {
                catImage.src = "laugh.gif";
                laughSound.play();

                // Change back to cat.jfif after 3 seconds
                setTimeout(() => {
                    catImage.src = "cat.jfif";
                }, 3000);

                // Add trade to the log
                addTradeToLog(data);
            }
        };

        ws.onerror = function (error) {
            console.error("WebSocket error:", error);
        };

        ws.onclose = function () {
            console.log("WebSocket connection closed");
        };
    });

    function addTradeToLog(trade) {
        trades.unshift(trade);
        if (trades.length > 5) {
            trades.pop();
        }
        updateTradeLog();
    }

    function updateTradeLog() {
        tradeLog.innerHTML = trades.map((trade, index) => `
            <div class="trade ${index === 0 ? 'new-trade' : ''}">
                <p>Trader: ${trade.traderPublicKey.substring(0, 6)}</p>
                <p>Type: ${trade.txType}</p>
                <p>Amount: ${trade.tokenAmount}</p>
            </div>
        `).join('');

        // Remove new-trade class after animation
        setTimeout(() => {
            const newTradeElement = tradeLog.querySelector('.new-trade');
            if (newTradeElement) {
                newTradeElement.classList.remove('new-trade');
            }
        }, 3000);
    }
});
