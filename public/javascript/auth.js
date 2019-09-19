$(document).ready(function() {

    $("#submit-login").on("click", function(e) {
      e.preventDefault();
      let signInBlock = $(this);
      if (!signInBlock.hasClass("active")) {
            signInBlock.addClass("active");
            const email = $('#username').val();
            const passwd = $('#password').val();

            if(email.length < 5 || passwd.length < 5){
                signInBlock.removeClass("active");
                return alert('Fields are missing');
            }
            const data = {pass: passwd, mail: email};
            const network = new Utils();
            network.makeCall('/auth/login',
                data,
                (resp)=>{
                localStorage.setItem('token',resp.token);
                if(resp.token.length>10){
                    window.location.href = resp.redirect;
                }
            }, (error)=>{
                new Modal({}).openAlert({type:'error',text:error.msg||'An error occured'});
            });

      }
    });

  //LOGIN DROP DOWN
    $("#floating-login").on("click", function(e) {
        e.preventDefault();
        let signInBlock = $(this);
        if (!signInBlock.hasClass("active")) {
          signInBlock.addClass("active");
          const ins = $('.sign-in-global input');
          $('.floating-login-status').text('');
          const data = {pass: ins[1].value, mail: ins[0].value};
          const network = new Utils();
          network.makeCall('/auth/login',
              data,(resp)=>{
                localStorage.setItem("token",resp.token);
                  if(resp.token.length>10){
                      window.location.href = resp.redirect;
                  }
                  signInBlock.removeClass("active");
            },(error)=>{
                let errors = "";
                signInBlock.removeClass("active");
                err.error.msg.forEach((element)=>{
                    errors += element.msg + '<br>';
                });
                $('.floating-login-status').text(error.msg);
            });
        }
      });

      //REGISTER USERS
    $("#register-user").on("click", function(e) {
        e.preventDefault();
        let signInBlock = $(this);
        if (!signInBlock.hasClass("active")) {
            //signInBlock.addClass("active");
            const email  = $('#email').val().trim();
            const passwd = $('#password').val().trim();
            const fname  = $('#fname').val().trim();
            const lname  = $('#lname').val().trim();
            const gender = $('#gender').val().trim();
            const level  = $('#level').val().trim();
            const termsCheck  = $('#accept-terms');
            const errors = [];
            checkValid($('#level'),1,errors,'Select your account type');
            checkValid($('#email'),5,errors,'Email is invalid');
            checkValid($('#password'),5,errors,'Password too short');
            checkValid($('#gender'),1,errors,'Invalid gender selected');
            checkValid($('#accept-terms'),1,errors,'Must agree to terms of service to use this service');

            if(errors.length > 0){
                $.each(errors,(key,value)=>{
                    console.log(value);
                   $(`#${value.id}`).addClass('error');
                   $('.error-container').html(value.msg);
                });
                signInBlock.removeClass("active");
                return;
            }

            const data = {pass: passwd, mail: email,fname:fname, lname:lname, userType:level, gender:gender,terms:termsCheck.is(':checked')};
            const network = new Utils();
            network.makeCall('/auth/register',
                data,
                (resp)=>{
                    let msg = resp.msg || resp.error.msg || resp;                        
                    new Modal({}).openAlert({type:'success',text:msg});
                    signInBlock.removeClass("active");
                },(err)=>{
                    console.log('catch block',err);
                    new Modal({}).openAlert({type:'error',text:err.error.msg||'An error occured'});
                   
                    
                });
        }
      });

//CLEAR ERROR FIELDS
$('body').on('click', '.error', function(){
    $(this).removeClass('error');
});

//VALIDATION
function checkValid(el,count,arr,txt){
    if(el.attr('type') === 'checkbox' && !el.is(':checked')){
        return arr.push({id:el.attr('id'),msg:txt});
    }
    if(el.val().length < count){
        arr.push({id:el.attr('id'),msg:txt});
   }
   if(el.attr('type') === 'email' && el.val().indexOf('@') === -1){
        arr.push({id:el.attr('id'),msg:txt});
   }
}



}); 