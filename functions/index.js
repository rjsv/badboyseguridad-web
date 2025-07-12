const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

// Configura el número máximo de instancias simultáneas
setGlobalOptions({ maxInstances: 10 });

const gmailEmail = process.env.GMAIL_EMAIL || process.env.FIREBASE_CONFIG && JSON.parse(process.env.FIREBASE_CONFIG).gmail?.email;
const gmailPassword = process.env.GMAIL_PASSWORD || process.env.FIREBASE_CONFIG && JSON.parse(process.env.FIREBASE_CONFIG).gmail?.password;

// Transportador con nodemailer y Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// Función HTTP para recibir los datos del formulario
exports.sendContactForm = onRequest(async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;

    const mailOptions = {
      from: email,
      to: gmailEmail,
      subject: `📩 Nuevo mensaje de contacto de ${nombre}`,
      text: `
      📧 Email: ${email}
      📱 Teléfono: ${telefono}
      
      📝 Mensaje:
      ${mensaje}
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info("Correo enviado con éxito");
    res.status(200).send("✅ Mensaje enviado correctamente.");
  } catch (error) {
    logger.error("Error al enviar el correo", error);
    res.status(500).send("❌ Error al enviar el mensaje.");
  }
});
