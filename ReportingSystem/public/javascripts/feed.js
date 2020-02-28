$(document).ready(
    function(){
     
     /*
     Function which makes get request to /getTodaysReports.
     The response is an array of (Reports) in JSON format.
     Extract all the data in the array and add it to a String along with HTML,CSS,BootStrap
     Use Jquery to add the String variable to the element in the feed.hbs page.
     */   
    getTodaysReports();
    function getTodaysReports() {			
        $.ajax({
            url: '/getTodaysReports/',
            type: 'GET',
            success: function (data) {
                //console.log(data) //for testing 
                var posts = "";
                for (var i = 0; i < data.length; i++) 
                {    //creates a new row for each Report and displays each attribute using HTML tags                    
                    posts+= " <div class='row text-white'><div class='col-sm-6'>"
                    + "<img src= '/"+data[i].image_file_name + "' style='width: 150px; height: 250px'>"
                    +"</div><div class='col-sm-6'>"+
                    "<p> Description: "+ data[i].description + "</p>"
                    + "<p>Building: "+data[i].building+"</p>"
                    + "<p>RoomNo:"+ data[i].room_number+"</p>"
                    +"<p>Status: "+data[i].status
                    +"<br>Votes: "+data[i].up_votes
                    +"<br><button type='button' id='del' name='changeStatus " 
                        + data[i]._id +"' class='btn btn-primary'>Fixed</button>"+
                   "<button type='button' id='del' name='delete "
                        +data[i]._id+"' class='btn btn-danger'>Delete</button>" 
                    +"</p></div></div><br>";
                }
                //Replaces inner HTML of element where id='todaysPosts' with posts. 
                $("#todaysPosts").html(posts); 
            }
        });
       // setTimeout(getTodaysReports, 1000); // recursively calls getTodaysReports (comments are refreshed every 10 seconds)
    }

});