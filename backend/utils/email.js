// Mock email utility for testing
const sendPaymentEmail = async (toEmail, policyNumber, amount) => {
  // Simulate sending email
  console.log(`Mock Email Sent:
To: ${toEmail}
Subject: Payment Link for Policy ${policyNumber}
Message: Click here to pay $${amount}: https://secure-payment.example.com/pay?policy=${policyNumber}&amount=${amount}
  `);

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true };
};

module.exports = { sendPaymentEmail };