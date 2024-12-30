const nodemailer = require('nodemailer')

const sendEmail = async options =>{
    /*  1)  create a transporter  (is a service actually send the mail something like gmail)  */
    const transporter = nodemailer.createTransport({
        // service: 'gmail',
        host: process.env.EMAILHOST,
        port: process.env.EMAILPORT,
        auth: {
            user: process.env.EMAILUSERNAME,
            pass: process.env.EMAILPASSWORD
        }
        // Activate in gmail 'less secured option'
    })

    /*  2)  Define email options    */
    const emailOption = {
        from: 'Bilal vhora <bilal005@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    /*  3)  Actually send the mail  */
    await transporter.sendMail(emailOption)
};

module.exports = sendEmail