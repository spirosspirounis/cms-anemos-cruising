function storeData(name, data) {
    return window.localStorage.setItem(name, JSON.stringify(data))
}

function getData(name) {
    var data = window.localStorage.getItem(name);
    return data ? JSON.parse(data) : []
}

function removeData(name) {
    return window.localStorage.removeItem(name);
}
// LOAD AVAILABILITY & BLOG
$(document).ready(function() {
    
       $('.availability_click').on("click", function(e){
            e.preventDefault(); // cancel the default a tag event.
            $.get( "availability.html", function( data ) {
              $(".app__main").html( data );
            });
    
       });

       $('.blog_click').on("click", function(e){
        e.preventDefault(); // cancel the default a tag event.

        $.get( "blog.html", function( data ) {
          $(".app__main").html( data );
        }).done(getpost);
   });
     });

   /*========================*/
   class Api {
    constructor(url) {
        this.url = url;
    }

    get(path) {
        return $.get(this.url + path);
    }

    post(path, data) {
        return $.post(this.url + path, data);
    }

    postImage(path, data) {
        return $.ajax({
            url: this.url + path,
            type: 'POST',
            data:data,
            contentType: false,
            processData: false
        });   
    }

}




var api = new Api('https://api.anemos-cruising.com')

function log(data) {
    console.log(data)
}

function failmsg(data){
  $(".failmsg").text(data.responseJSON.error[0])
  }


function userLogin(data) {
    log(data);
    storeData('user', data.data)
    if(data.data){
    location.replace("cms_page/dashboard.html")
    } 
}




//Log Out
$(document).on('click', ".logout", function(e){
    e.preventDefault();
    removeData("user");
    location.replace("../index.html");
    });

var sPath = window.location.pathname;
var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);
function login_check(){
if(getData('user').length==0 && sPage != "index.html"){
    location.replace("../index.html")
}
else if(getData('user').length!=0 && (sPage == "index.html" || sPage == "")) {
    location.replace("cms_page/dashboard.html")
}
}
login_check();

//Log In
$(".login100-form" ).submit(function( event ) {
  event.preventDefault();
  var credentials = {'username': $(this).find("input[name='username']").val(), 'password': $(this).find("input[name='password']").val()}
  log(credentials);
  api.post('/auth/login', credentials).done(userLogin).fail(failmsg);
});

// create box blog
function postBox(post,card){
    log(post)
    k = $(card).clone()
    k.find(".card").css('background-image', 'url('+ post.image +')');
    k.find(".title").text(post.title)
    k.find(".date").text(post.createdAt)
    k.find(".editor").text(post.content)
    $(".cards-wrapper").append(k);
    k.css("display","block");
    k.find(".id").text(post.id);
}

 function getpost(){
api.get("/post").done(showposts)
 }
 

 function showposts(data){
    log(data)
    return $.Deferred(function() {
        var self = this;
        k = null
        $.get("blog.html", function(card) {
        }).then(function (card) {
            $.each(data.data, function(index, value) {
               postBox(value, $(card).find(".card-grid-space").first())
            });
        }).then(function () {
            self.resolve()
        });
    });
}

//create post
$("#blog" ).submit(function( event ) {
    event.preventDefault();
    var credentials = {'title': $(this).find("input[name='title']").val(), 'date': $(this).find("input[name='date']").val(), 'editor': $(this).find("textarea[name='editor']").val(), 'image': $(this).find("input[name='image']").val()}
    if($("#myModal").find(".id").text() != ""){
    api.postImage('/post/' + $("#myModal").find(".id").text(), new FormData(this)).done(function(){
        location.reload();
    });
   }else {
    api.postImage('/post', new FormData(this)).done(function(){
    location.reload();
    
   });
}
  });


   //edit
   $(document).on('click', ".edit", function(e){
    e.preventDefault();
    var id = $(this).closest(".card").find(".id").text()
    var title = $(this).closest(".card").find(".title").text()
    var date = $(this).closest(".card").find(".date").text()
    date = new Date(date);
    var date_string = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    var content= $(this).closest(".card").find(".editor").text()
    $("#myModal").find(".id").text(id);
    $("#myModal").find("input[name='title']").val(title)
    $("#myModal").find("input[name='date']").val(date_string)
    $("#myModal").find("textarea[name='editor']").val(content)
})




  //delete post
 
$(document).on('click', ".delete", function(e){
    e.preventDefault();
    var id = $(this).closest(".card").find(".id").text()
    console.log(id)
    api.get('/post/delete/' + id).done(function(){
    location.reload();
    });
})