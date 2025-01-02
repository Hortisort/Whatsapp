// Import required packages
const express = require("express");
const axios = require("axios");

// Initialize the express app
const app = express();
app.use(express.json());

// Define constants
const PORT = 3000;
const GRAPH_API_TOKEN = "EAAMVPs806DwBO4XZBpufnrN3OLZAchTG2vvT426iIZAPP9P1ygU7dM77bcACr6p5Lk22dEw0GVVjq90Dl40ZAcRlDb9VfFZCwkak2fV4MyNleijrrGWjEGMn7Ucg8yyZC6AVr4tBoK1f9U6dsPXxMPehGrXhS9TJqOZBkpNZAit4W5IMLAB5jCMzKWG7UNHapm60agZDZD"; // Replace with your token
const VERIFY_TOKEN = "Hortisort@123"; // Replace with your verification token
let webhookData = []; // Store webhook data
const processedMessages = new Set(); // Track processed messages

// Verify webhook
app.get("/webhook", (req, res) => {
  const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403); // Forbidden
});

// Handle incoming messages
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // Acknowledge webhook

  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const businessPhoneNumberId = req.body?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

    if (message?.type === "text" && !processedMessages.has(message.id)) {
      processedMessages.add(message.id); // Mark as processed
      const responseText = "Contact Us:\nZentron Labs Pvt Ltd\n91 92095 95909\nhortisort.support@zentronlabs.com";

      // Send response
      await axios.post(
        `https://graph.facebook.com/v21.0/${businessPhoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: message.from,
          text: { body: responseText },
        },
        { headers: { Authorization: `Bearer ${GRAPH_API_TOKEN}` } }
      );

      console.log(`Response sent to ${message.from}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error.message);
  }
});

// Route to get webhook data
app.get("/get-webhook-data", (req, res) => {
  res.json(webhookData);
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
