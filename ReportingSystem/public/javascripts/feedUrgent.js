$(document).ready(
    function(){
     
           
              
          $.ajax({
            url: '/getAllUrgentReports/',
            type: 'GET',
            success: function (data) {
              console.log(data)
              console.log("Number of Reports: " + data.length)
              //3 variables for each col of bootstrap grid
              var postsL = "";
              var postsM = "";
              var postsR = "";
              for (var i = 0; i < data.length; i++) {
      
                /*Creates a string of HTML,CSS and data on each Report
                Assigns it to a temporary variable and reassigns for each Report
                */
               posts= " <div class='row'><div class='col-sm-6'>"
                              + "<img onclick= "+str+" name ='img' src= '/"+data[i].image_file_name  
                              + "' style='width: 50px; height: 50px'>"+" Votes: "+data[i].votes
                              +"<br><br><button type='button' id='del' name='changeStatus " 
                              + data[i]._id +" Older' class='btn btn-primary'>Fixed</button>"+
                              "<button type='button' id='del' name='delete "
                              +data[i]._id+" Older' class='btn btn-danger'>Delete</button>" 
                              +"</div><div class='col-sm-6'style='text-align: left'>"+"<p>Building: "+data[i].building+"</p>"
                              + "<p>RoomNo:"+ data[i].room_number+"</p>"
                              +
                              "<p> Description: "+ data[i].description + "</p>"
                              +"<p>Status: "+data[i].status
                              +"<br>" 
                              +"</p></div></div><br>";
      
                //Ensures even distribution of Reports across 3 columns
                if ((i + 1) % 3 == 0) {
                  postsR += posts;
                } else if ((i + 1) % 2 == 0) {
                  postsM += posts;
                } else {
                  postsL += posts;
                }
      
              }
              //Replace inner HTMl, each element represents a col in grid.
              $("#UrgentReportsR").html(postsR);
              $("#UrgentReportsM").html(postsM);
              $("#UrgentReportsL").html(postsL);
      
            }
          });
     
      
       

    //Delets Report from DB
    $("#posts").click(function (event){
        /*splits name of target(button clicked) at every space, adding it to an array
        Name consits of 1) Desired Action & 2) id of Report in DB  
        */
        var targetArray = event.target.name.split(" ");
        console.log(targetArray[2]);
        //If true, sends delte request, passing id as param.
        if(targetArray[0] == "delete"){
            //alert("Disabled During Demo ");  //uncomment for demo + disable below
            $.ajax({
            url: '/deleteReport/' + targetArray[1],
            type: 'DELETE',
            success: function(result) {
                if (targetArray[2] == "Today"){
                getTodaysReports(); //reloads Reports
                }else if (targetArray[2]== "Weekly"){
                    getWeeklyReports();
                }else getOlderReports();
                    }
            });
        }
    });

    //Changes status of Report to false 
    $("#posts").click(function (event){
        var targetArray = event.target.name.split(" ");
        console.log(targetArray[2]);
        if(targetArray[0] == "changeStatus"){
            $.ajax({
            url: '/changeStatusFalse/' + targetArray[1],
            type: 'PUT',
            success: function(result) {
                if (targetArray[2] == "Today"){
                    getTodaysReports(); //reloads Reports
                    }else if (targetArray[2]== "Weekly"){
                        getWeeklyReports();
                    }else getOlderReports();
                        }
            });
        }
    });
});