// var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//   service: 'outlook',
//   auth: {
//     user: 'ianag11@hotmail.com',
//     pass: 'INL053002'
//   }
// });

// var mailOptions = {
//   from: 'ianag11@hotmail.com',
//   to: 'nicolas.andriano.99g',
//   subject: 'Sending Email using Node.js',
//   html: '<h1>Welcome</h1><p>That was easy!</p>'
// };

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// }); 

var nodemailer = require('nodemailer');

// Create the transporter with the required configuration for Outlook
// change the user and pass !
var transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
       ciphers:'SSLv3'
    },
    auth: {
        user: 'ianag11@hotmail.com',
        pass: 'INL053002'
    }
});

// setup e-mail data, even with unicode symbols
var mailOptions = {
    from: '"Our Code World " <ianag11@hotmail.com>', // sender address (who sends)
    to: 'nicolas.andriano99g@gmail.com', // list of receivers (who receives)
    subject: 'Hello ', // Subject line
    text: 'Hello world ', // plaintext body
    html: '<b>Hello world </b><br> send nudes.js' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }

    console.log('Message sent: ' + info.response);
});

