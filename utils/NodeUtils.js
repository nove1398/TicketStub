const NodeMailer = require('nodemailer');
const Config = require('../utils/Config.js');


exports.isAddress = (text, errArr, errMsg) => {
    var regex = new RegExp("^[a-zA-Z]+$");
    if (!regex.exec(text)) {
        errArr.push({
            msg: `'${text}' ${errMsg}`
        });
    }
}
exports.isAlpha = (text, errArr, errMsg) => {
    var regex = /[\w\\'\s\.]+$/gm;
    if (!regex.exec(text)) {
        errArr.push({
            msg: `'${text}' ${errMsg}`
        });

    }
}
exports.isName = (text, errArr, errMsg) => {
    var regex = /[a-zA-Z\\']+$/gm;
    if (!regex.exec(text)) {
        errArr.push({
            msg: `'${text}' ${errMsg}`
        });
    }
}
exports.isAlphaNum = (text, errArr, errMsg) => {
    var regex = /[\w\\'\s]+$/gm;
    if (!regex.exec(text)) {
        errArr.push({
            msg: `'${text}' ${errMsg}`
        });
    }
}
exports.isTime = (text, errArr, errMsg) => {
    var regex = /([0-9]+)|(^:[:0-9]+$)/gm;
    if (!regex.exec(text)) {
        errArr.push({
            msg: `'${text}' ${errMsg}`
        });
    }
}
exports.isNumeric = (num, errArr, errMsg) => {
    var regex = /^[0-9]+$/gm;
    if (!regex.exec(num)) {
        errArr.push({
            msg: `'${num}' is not valid for ${errMsg}`
        });
    }

}

exports.isValidEmail = (text) => {
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (typeof text !== 'string' || text.length < 5 || !regex.test(text.toLowerCase())) {
        const errors = new Error('Not Email');
        errors.status = 401;
        errors.code = 12000;
        errors.msg = `'${text}' is not a valid email`;
        throw errors;
    }
}

exports.isEmpty = (text) => {
    if (text.length < 1) {
        const error = new Error('Empty string');
        error.msg = "Value is empty";
        error.code = 12000;
        error.code = 401;
        throw error;
    }
}

exports.toTitleCase = (str) => {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

exports.prettyDate = (date) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let temp = new Date(date);
    let year = temp.getFullYear();
    return monthNames[temp.getMonth()] + ' ' + temp.getDate() + ', ' + year;
};

exports.parseRsvpReceipt = (data) => {
    return `<table align="center" border="0" cellpadding="0" cellspacing="0"  style="box-sizing: content-box;max-width:400px;">
    <tr>
     <td bgcolor="#898989" style="text-align:center;">
       <a href="https://islandstub.ca" target="_blank" style="display: inline-block;">
         <div style="margin-left:auto;margin-right:auto;margin-top: 10px;margin-bottom: 10px;height: 120px;max-width: 200px;border-radius:50%;border:2px solid #466; background-color: white;position:relative;">
           <img src="https://islandstub.ca/img/black-logo.png" alt="IslandStub inc." style="max-width:80%;transform: rotate(-10deg)">
         </div>
       </a>
     </td>
    </tr> 
    <tr>
     <td bgcolor="#ffffff">
       <table border="0" cellpadding="10" cellspacing="0" width="100%">
         <tr> 
           <td colspan="3" bgcolor="#898989" style="color: #fff;
   border: 0;
   margin: 0;
   padding: 5px;
   font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
   font-size: 15px;
   line-height: 21px;">
             Thank You <b>${data.name}</b>!
             <br>
           Your RSVP for 1 ticket to attend <b>${data.eventName}</b> was successful! This is your official receipt. You may print or present this receipt as proof of receeipt.
           </td> 
         </tr>
         <tr>
           <td colspan="2" style="color: #77858c;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
   font-size: 13px;
   line-height: 17px;">${data.date}</td>
           <td colspan="1" align="center" style="font-weight: bold;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
   font-size: 16px;
   line-height: 17px;">Order#<br>${data.orderNumber}</td>
         </tr>
        <tr>
           <td width="280" valign="top" align="center" colspan="4">
            <img src="data:image/png;base64,${data.bar}" alt="IslandStub inc." style="max-width:280px;">
           </td>
         </tr>
         <tr>
           <td width="80" colspan="2"style="text-align:center;color: #77858c;
   font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
   font-size: 12px;">
            Order Info
           </td>
           <td width="20" colspan="1" style="text-align:center;color: #77858c;
   font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
   text-align: right;
   font-size: 12px;">
            Amount
           </td>
        </tr>
        <tr >
          <td colspan="2" style="color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
                                 font-size: 14px;
                                 font-weight: normal;
                                 line-height: 13px;">
            RSVP
          </td>
          <td colspan="1" style="color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
                                 font-size: 14px;
                                 font-weight: normal;
                                 text-align: right;
                                 max-width: 200px;
                                 line-height: 13px;">
            $0.00
          </td>
         </tr>       
        <tr>
         <td colspan="2"  style="color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 14px;
            fontweight:bold;                             
            font-weight: normal;
            line-height: 17px;">Fees</td>
         <td  colspan="1" style="color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 17px;
            font-weight: bold;
            text-align: right;
            max-width: 200px;
            line-height: 17px;">$0.00</td>
       </tr>
           <tr>
           <td colspan="2"  style="text-align: center;color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
        font-size: 14px;
        fontweight:bold;                             
        font-weight: normal;
        text-align: left;
        line-height: 17px;">Total</td>
           <td  colspan="1" style="color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
        font-size: 17px;
        font-weight: bold;
        text-align: right;
        max-width: 200px;
        line-height: 17px;">$0.00</td>
         </tr>
       </table>
     </td>
    </tr>
    <tr>
     <td bgcolor="#e2e2eb" style="padding: 30px 30px 30px 30px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
         <td width="70%" align="center" style="color: #222; font-family: Arial, sans-serif; font-size: 14px;">
           <a href="https://islandstub.ca" style="color: #222;">IslandStub inc.&reg;</a> 
           <br><br>
           Have a question? Need help? 
           <br>
           Send an email to <a href="mailto:support@islandstub.ca?Subject=Help%20Request" target="_top"> support@islandstub.ca</a> 
            <table border="0" cellpadding="0" cellspacing="0">
             <tr>
              <td>
                <br>
               <a href="http://www.twitter.com/islandstub" target="_blank">
                <img src="https://68ef2f69c7787d4078ac-7864ae55ba174c40683f10ab811d9167.ssl.cf1.rackcdn.com/twitter-icon_32x32.png" alt="Twitter" width="20" height="20" style="display: block;" border="0">
               </a>
              </td>
              <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
              <td>
                <br>
               <a href="https://facebook.com/islandstub" target="_blank">
                 <img src="https://68ef2f69c7787d4078ac-7864ae55ba174c40683f10ab811d9167.ssl.cf1.rackcdn.com/facebook-icon_32x32.png" alt="Facebook" width="20" height="20" style="display: block;" border="0">
               </a>
              </td>
             </tr>
            </table>
           </td>
        </tr>
       </table>
     </td>
    </tr>
   </table>`;
};
exports.parseHtmlReceipt = (data) => {
    let breakdownRow = '';
    for (let i = 0; i < data.tickets.length; i++) {
        let ticket = data.tickets[i];
        if (ticket.quantity < 1) continue;
        breakdownRow += `<tr >
                        <td colspan="2" style="color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
                            font-size: 14px;
                            font-weight: normal;
                            line-height: 13px;">
                                ${ticket.ticketAmount+'x '+ticket.name}
                        </td>
                        <td colspan="1" style="color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
                            font-size: 14px;
                            font-weight: normal;
                            text-align: right;
                            max-width: 200px;
                            line-height: 13px;">
                                $${ticket.getTotal()}
                        </td>
                    </tr>`;
    }

    return `<table align="center" border="0" cellpadding="0" cellspacing="0"  style="box-sizing: content-box;max-width:400px;">
    <tr>
     <td bgcolor="#898989" style="text-align:center;">
       <a href="https://islandstub.ca" target="_blank" style="display: inline-block;">
         <div style="margin-left:auto;margin-right:auto;margin-top: 10px;margin-bottom: 10px;height: 120px;max-width: 200px;border-radius:50%;border:2px solid #466; background-color: white;position:relative;">
           <img src="https://islandstub.ca/img/black-logo.png" alt="IslandStub inc." style="max-width:80%;transform: rotate(-10deg)">
         </div>
       </a>
     </td>
    </tr> 
    <tr>
     <td bgcolor="#ffffff">
       <table border="0" cellpadding="10" cellspacing="0" width="100%">
         <tr> 
           <td colspan="3" bgcolor="#898989" style="color: #fff;
   border: 0;
   margin: 0;
   padding: 5px;
   font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
   font-size: 15px;
   line-height: 21px;">
             Thank You <b>${data.buyerName}</b>!
             <br>
           Your payment of $${data.totalCost} for ${data.totalNumber} ticket(s) to attend <b>${data.eventName}</b> was successful! This is your official receipt. You may print or present this receipt as proof of purchase.
           </td> 
         </tr>
         <tr>
           <td colspan="2" style="color: #77858c;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
   font-size: 13px;
   line-height: 17px;">${data.date}</td>
           <td colspan="1" align="center" style="font-weight: bold;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
   font-size: 16px;
   line-height: 17px;">Order#<br>${data.orderNumber}</td>
         </tr>
        <tr>
           <td width="280" valign="top" align="center" colspan="4">
            <img src="data:image/png;base64,${data.bar}" alt="IslandStub inc." style="max-width:280px;">
           </td>
         </tr>
         <tr>
           <td width="80" colspan="2"style="text-align:center;color: #77858c;
   font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
   font-size: 12px;">
            Order Info
           </td>
           <td width="20" colspan="1" style="text-align:center;color: #77858c;
   font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
   text-align: right;
   font-size: 12px;">
            Amount
           </td>
        </tr>
        ${ breakdownRow }        
        <tr>
         <td colspan="2"  style="color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 14px;
            fontweight:bold;                             
            font-weight: normal;
            line-height: 17px;">Fees</td>
         <td  colspan="1" style="color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size: 17px;
            font-weight: bold;
            text-align: right;
            max-width: 200px;
            line-height: 17px;">$${data.fees}</td>
       </tr>
           <tr>
           <td colspan="2"  style="text-align: center;color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
        font-size: 14px;
        fontweight:bold;                             
        font-weight: normal;
        text-align: left;
        line-height: 17px;">Total</td>
           <td  colspan="1" style="color: #292e31;font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif;
        font-size: 17px;
        font-weight: bold;
        text-align: right;
        max-width: 200px;
        line-height: 17px;">$${data.totalCost}</td>
         </tr>
       </table>
     </td>
    </tr>
    <tr>
     <td bgcolor="#e2e2eb" style="padding: 30px 30px 30px 30px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
         <td width="70%" align="center" style="color: #222; font-family: Arial, sans-serif; font-size: 14px;">
           <a href="https://islandstub.ca" style="color: #222;">IslandStub inc.&reg;</a> 
           <br><br>
           Have a question? Need help? 
           <br>
           Send an email to <a href="mailto:support@islandstub.ca?Subject=Help%20Request" target="_top"> support@islandstub.ca</a> 
            <table border="0" cellpadding="0" cellspacing="0">
             <tr>
              <td>
                <br>
               <a href="http://www.twitter.com/islandstub" target="_blank">
                <img src="https://68ef2f69c7787d4078ac-7864ae55ba174c40683f10ab811d9167.ssl.cf1.rackcdn.com/twitter-icon_32x32.png" alt="Twitter" width="20" height="20" style="display: block;" border="0">
               </a>
              </td>
              <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
              <td>
                <br>
               <a href="https://facebook.com/islandstub" target="_blank">
                 <img src="https://68ef2f69c7787d4078ac-7864ae55ba174c40683f10ab811d9167.ssl.cf1.rackcdn.com/facebook-icon_32x32.png" alt="Facebook" width="20" height="20" style="display: block;" border="0">
               </a>
              </td>
             </tr>
            </table>
           </td>
        </tr>
       </table>
     </td>
    </tr>
   </table>`;
}

exports.parseBankingInfo = (data) => {
    return `<!DOCTYPE>
    <html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0;">
         <meta name="format-detection" content="telephone=no"/>
    
        <!-- Responsive Mobile-First Email Template by Konstantin Savchenko, 2015.
        https://github.com/konsav/email-templates/  -->
    
        <style>
    /* Reset styles */ 
    body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important;}
    body, table, td, div, p, a { -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; border-spacing: 0; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    #outlook a { padding: 0; }
    .ReadMsgBody { width: 100%; } .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
    
    /* Rounded corners for advanced mail clients only */ 
    @media all and (min-width: 560px) {
        .container { border-radius: 8px; -webkit-border-radius: 8px; -moz-border-radius: 8px; -khtml-border-radius: 8px;}
    }
    
    /* Set color for auto links (addresses, dates, etc.) */ 
    a, a:hover {
        color: #127DB3;
    }
    .footer a, .footer a:hover {
        color: #999999;
    }
    
         </style>
    
        <!-- MESSAGE SUBJECT -->
        <title>IslandStub</title>
    
    </head>
    
    <!-- BODY -->
    <!-- Set message background color (twice) and text color (twice) -->
    <body topmargin="0" rightmargin="0" bottommargin="0" leftmargin="0" marginwidth="0" marginheight="0" width="100%" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%;
        background-color: #F0F0F0;
        color: #000000;"
        bgcolor="#F0F0F0"
        text="#000000">
    
    <!-- SECTION / BACKGROUND -->
    <!-- Set message background color one again -->
    <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%;" class="background"><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;"
        bgcolor="#F0F0F0">
    
    <!-- WRAPPER -->
    <!-- Set wrapper width (twice) -->
    <table border="0" cellpadding="0" cellspacing="0" align="center"
        width="560" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit;
        max-width: 560px;" class="wrapper">
    
        <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
                padding-top: 20px;
                padding-bottom: 20px;">
    
            </td>
        </tr>
    
    <!-- End of WRAPPER -->
    </table>
    
    <!-- WRAPPER / CONTEINER -->
    <!-- Set conteiner background color -->
    <table border="0" cellpadding="0" cellspacing="0" align="center"
        bgcolor="#FFFFFF"
        width="560" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit;
        max-width: 560px;" class="container">
    
        <!-- HEADER -->
        <!-- Set text color and font family ("sans-serif" or "Georgia, serif") -->
        <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 24px; font-weight: bold; line-height: 130%;
                padding-top: 25px;
                color: #000000;
                font-family: sans-serif;" class="header">
                    IslandStub Promotor Information
            </td>
        </tr>
        
        <!-- SUBHEADER -->
        <!-- Set text color and font family ("sans-serif" or "Georgia, serif") -->
        <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-bottom: 3px; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 18px; font-weight: 300; line-height: 150%;
                padding-top: 5px;
                color: #000000;
                font-family: sans-serif;" class="subheader">
                    New banking information received
            </td>
        </tr>
    
        <!-- HERO IMAGE -->
        <!-- Image text color should be opposite to background color. Set your url, image src, alt and title. Alt text should fit the image size. Real image size should be x2 (wrapper x2). Do not set height for flexible images (including "auto"). URL format: http://domain.com/?utm_source={{Campaign-Source}}&utm_medium=email&utm_content={{Ìmage-Name}}&utm_campaign={{Campaign-Name}} -->
        <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;
                padding-top: 20px;" class="hero">
          <a target="_blank" style="text-decoration: none;"
                href="https://islandstub.com">
            <img border="0" vspace="0" hspace="0"
                src="https://islandstub.com/img/black-logo.png"
                alt="Please enable images to view this content" title="Hero Image"
                width="560" style="
                width: 100%;
                max-width: 560px;
                color: #000000; font-size: 13px; margin: 0; padding: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: block;"/>
          </a>
          
        </td>
        </tr>
        <!-- PARAGRAPH -->
        <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
        <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
                padding-top: 25px; 
                color: #000000;
                font-family: sans-serif;" class="paragraph">
            </td>
        </tr>
    
        <!-- BUTTON -->
        <!-- Set button background color at TD, link/text color at A and TD, font family ("sans-serif" or "Georgia, serif") at TD. For verification codes add "letter-spacing: 5px;". Link format: http://domain.com/?utm_source={{Campaign-Source}}&utm_medium=email&utm_content={{Button-Name}}&utm_campaign={{Campaign-Name}} -->
        <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
                padding-top: 25px;
                padding-bottom: 5px;" class="button">
            </td>
        </tr>
        <!-- LINE -->
        <!-- Set line color -->
        <tr>	
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
                padding-top: 25px;" class="line"><hr
                color="#E0E0E0" align="center" width="100%" size="1" noshade style="margin: 0; padding: 0;" />
            </td>
        </tr>
    
        <!-- LIST -->
        <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%;" class="list-item"><table align="center" border="0" cellspacing="0" cellpadding="0" style="width: inherit; margin: 0; padding: 0; border-collapse: collapse; border-spacing: 0;">
                
                <!-- LIST ITEM -->
                <tr>
                    <!-- LIST ITEM IMAGE -->
                    <!-- LIST ITEM TEXT -->
                    <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
                    <td align="left" valign="top" style="font-size: 17px; font-weight: 400; line-height: 160%; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;
                        padding-top: 25px;
                        color: #000000;
                        font-family: sans-serif;" class="paragraph">
                            <b style="color: #333333;">Institute Number</b><br/>
                            ${data[0]}
                    </td>
                </tr>
                <!-- LIST ITEM -->
                <tr>
                    <!-- LIST ITEM IMAGE -->
                    <!-- LIST ITEM TEXT -->
                    <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
                    <td align="left" valign="top" style="font-size: 17px; font-weight: 400; line-height: 160%; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;
                        padding-top: 25px;
                        color: #000000;
                        font-family: sans-serif;" class="paragraph">
                            <b style="color: #333333;">Transit/Branch Number</b><br/>
                            ${data[1]}
                    </td>
                </tr>
        <tr>
                    <!-- LIST ITEM IMAGE -->
                    <!-- LIST ITEM TEXT -->
                    <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
                    <td align="left" valign="top" style="font-size: 17px; font-weight: 400; line-height: 160%; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;
                        padding-top: 25px;
                        color: #000000;
                        font-family: sans-serif;" class="paragraph">
                            <b style="color: #333333;">Account Number</b><br/>
                            ${data[2]}
                    </td>
                </tr>
              <tr>
                    <!-- LIST ITEM IMAGE -->
                    <!-- Image text color should be opposite to background color. Set your url, image src, alt and title. Alt text should fit the image size. Real image size should be x2 -->
                    <!-- LIST ITEM TEXT -->
                    <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
                    <td align="left" valign="top" style="font-size: 17px; font-weight: 400; line-height: 160%; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;
                        padding-top: 25px;
                        color: #000000;
                        font-family: sans-serif;" class="paragraph">
                            <b style="color: #333333;">Bank Name</b><br/>
                            ${data[3]}
                    </td>
    
                </tr>
              <tr>
                    <!-- LIST ITEM TEXT -->
                    <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
                    <td align="left" valign="top" style="font-size: 17px; font-weight: 400; line-height: 160%; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;
                        padding-top: 25px;
                        color: #000000;
                        font-family: sans-serif;" class="paragraph">
                            <b style="color: #333333;">Account Holder/Business Name</b><br/>
                            ${data[4]}
                    </td>
    
                </tr>
              <tr>
                    <!-- LIST ITEM IMAGE -->
                    <!-- LIST ITEM TEXT -->
                    <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
                    <td align="left" valign="top" style="font-size: 17px; font-weight: 400; line-height: 160%; border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;
                        padding-top: 25px;
                        color: #000000;
                        font-family: sans-serif;" class="paragraph">
                            <b style="color: #333333;">PayPal Email(if applicable)</b><br/>
                            ${data[5]}
                    </td>
    
                </tr>
            </table>
          
        </td>
        </tr>
    
        <!-- LINE -->
        <!-- Set line color -->
        <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
                padding-top: 25px;" class="line"><hr
                color="#E0E0E0" align="center" width="100%" size="1" noshade style="margin: 0; padding: 0;" />
            </td>
        </tr>
    
        <!-- PARAGRAPH -->
        <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
        <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
                padding-top: 20px;
                padding-bottom: 25px;
                color: #000000;
                font-family: sans-serif;" class="paragraph">
                    Have a&nbsp;question? <a href="mailto:support@islandstub.ca" target="_blank" style="color: #127DB3; font-family: sans-serif; font-size: 17px; font-weight: 400; line-height: 160%;">support@islandstub.ca</a>
            </td>
        </tr>
    
    <!-- End of WRAPPER -->
    </table>
    
    <!-- WRAPPER -->
    <!-- Set wrapper width (twice) -->
    <table border="0" cellpadding="0" cellspacing="0" align="center"
        width="560" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit;
        max-width: 560px;" class="wrapper">
    
        <!-- SOCIAL NETWORKS -->
        <!-- Image text color should be opposite to background color. Set your url, image src, alt and title. Alt text should fit the image size. Real image size should be x2 -->
        <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
                padding-top: 25px;" class="social-icons"><table
                width="256" border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse: collapse; border-spacing: 0; padding: 0;">
                <tr>
    
                    <!-- ICON 1 -->
                    <td align="center" valign="middle" style="margin: 0; padding: 0; padding-left: 10px; padding-right: 10px; border-collapse: collapse; border-spacing: 0;">
              <a target="_blank"
                        href="https://facebook.com/islandstub"
                    style="text-decoration: none;">
              <img border="0" vspace="0" hspace="0" style="padding: 0; margin: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: inline-block;
                        color: #000000;"
                        alt="F" title="Facebook"
                        width="44" height="44"
                        src="https://raw.githubusercontent.com/konsav/email-templates/master/images/social-icons/facebook.png"></a></td>
    
                    <!-- ICON 2 -->
                    <td align="center" valign="middle" style="margin: 0; padding: 0; padding-left: 10px; padding-right: 10px; border-collapse: collapse; border-spacing: 0;">
              <a target="_blank"
                        href="http://www.twitter.com/islandstub"
                    style="text-decoration: none;">
              <img border="0" vspace="0" hspace="0" style="padding: 0; margin: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: inline-block;
                        color: #000000;"
                        alt="T" title="Twitter"
                        width="44" height="44"
                        src="https://raw.githubusercontent.com/konsav/email-templates/master/images/social-icons/twitter.png"></a></td>				
            
                    <!-- ICON 4 -->
                    <td align="center" valign="middle" style="margin: 0; padding: 0; padding-left: 10px; padding-right: 10px; border-collapse: collapse; border-spacing: 0;">
              <a target="_blank"
                        href="https://www.instagram.com/islandstub/"
                    style="text-decoration: none;">
              <img border="0" vspace="0" hspace="0" style="padding: 0; margin: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: inline-block;
                        color: #000000;"
                        alt="I" title="Instagram"
                        width="44" height="44"
                        src="https://raw.githubusercontent.com/konsav/email-templates/master/images/social-icons/instagram.png"></a></td>
    
                </tr>
                </table>
            </td>
        </tr>
    
        <!-- FOOTER -->
        <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
        <tr>
        </tr>
    <!-- End of WRAPPER -->
    </table>
    
    <!-- End of SECTION / BACKGROUND -->
    </td>
      
      </tr>
      
      </table>
    
    </body>
    </html>`;
}
exports.getUserType = (level) => {
    switch (level) {
        case 1:
            return 'Admin';
        case 2:
            return 'Creator';
        case 3:
            return 'User';
        default:
            return 'Viewer';
    }
}

/**
 * 
 * @param emailObj 
 * {
 * subjectText Test Email! / 
 * htmlBody <h1>Hello, test email </h1>/ 
 * recipientsEmails  Test Tester <test@yahoo.com>/ 
 * attachmentFiles { 
                filename - name of attachment(test_file.pdf)
                 path - path of the attachment file(c:/folder/test_file.pdf)
              }
 * }
 */
exports.emailPusher = (emailObj) => {
    let senderInfo = 'IslandStub inc. <sales@islandstub.ca>';
    let {
        subjectText,
        htmlBody,
        recipientsEmails,
        attachmentFiles
    } = emailObj;

    // Create a SMTP transporter object
    let transporter = NodeMailer.createTransport({
        host: Config.mailData().host,
        port: 465,
        secure: true,
        auth: {
            user: Config.mailData().user,
            pass: Config.mailData().pass
        },
        // tls: {
        //     rejectUnauthorized: false
        // },
        logger: false,
        debug: false // include SMTP traffic in the logs
    }, {
        // sender info
        from: senderInfo
    });

    // Message object
    let message = {
        // Comma separated list of recipients
        to: `${recipientsEmails}`,
        // Subject of the message
        subject: subjectText,
        //Body of document
        html: htmlBody,
        // An array of attachment objects defined as:
        //      { 
        //          filename - name of attachment(test_file.pdf)
        //          path - path of the attachment file(c:/folder/test_file.pdf)
        //      }
        attachments: [attachmentFiles || {}]
    };
    transporter.sendMail(message);
}