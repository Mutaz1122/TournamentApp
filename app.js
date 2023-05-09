//jshint esversion:6
const chance = require('chance').Chance();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/tournamentdb');



// const Match ={ T1: String , T1result: Number, T2: String , T2result: Number};
const Tournament = mongoose.model('Tournament', { name: String , Sdate: Date, Edate: Date, teams:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }]});
const Team = mongoose.model('Team', { name: String , manager: String, coach: String,captain:String,points:Number, players:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }] });
const Player = mongoose.model('Player', { name: String , goals: Number, Ycard: Number,Rcard:Number, postion:String });
const Match = mongoose.model('Match', { T1: String ,Mdate: Date, T1result: Number, T2: String , T2result: Number});
const Request = mongoose.model('Request', { Pname: String, Tname: String});

async function createPlayer(Pname) {
  const player = new Player({
    name: Pname,
    goals: chance.integer({ min: 0, max: 20 }),
    Ycard: chance.integer({ min: 0, max: 10 }),
    Rcard: chance.integer({ min: 0, max: 5 }),
    position: chance.pickone(['Forward', 'Midfielder', 'Defender', 'Goalkeeper']),
  });
  await player.save();
  return player;
}

async function createTeam(name,numOfPlayers) {
  const players = [];
  for (let i = 0; i < numOfPlayers; i++) {
    const player = await createPlayer(chance.name());
    players.push(player);
  }
  const team = new Team({
    name: name,
    manager: chance.name(),
    coach: chance.name(),
    captain: "Not selected",
    players: players,
    points:chance.integer({ min: 0, max: 40 }),
  });
  await team.save();
  return team;
}

async function createMatch(teams) {
  const teamNames = teams.map((team) => team.name);
  const [T1, T2] = chance.pickset(teamNames, 2);
  const match = new Match({
    T1: T1,
    T1result: chance.integer({ min: 0, max: 10 }),
    T2: T2,
    T2result: chance.integer({ min: 0, max: 10 }),
    Mdate:chance.date()
  });
  await match.save();
  return match;
}

async function createTournament(name1,numOfTeams, numOfPlayersPerTeam, numOfMatches) {
  const teams = [];
  const matches = [];
  for (let i = 0; i < numOfTeams; i++) {
    const team = await createTeam(chance.country({ full: true }),numOfPlayersPerTeam);
    teams.push(team);
  }
  for (let i = 0; i < numOfMatches; i++) {
    const match = await createMatch(teams);
    matches.push(match);
  }
  const tournament = new Tournament({
    name:name1,
    Sdate: chance.date(),
    Edate: chance.date(),
    teams: teams,
    matches: matches,
  });
  await tournament.save();
  return tournament;
}

// createTournament(3, 11, 4)
//   .then((tournament) => {
//     console.log(tournament);
//     mongoose.disconnect();
//   })
//   .catch((error) => {
//     console.log(error);
//     mongoose.disconnect();
//   });


const homeStartingContent = "Wlcome to the KFUPM Tournaments website";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
var posts=[];
app.get("/", async function(req,res){
  const FoundTournament = await Tournament.find({});
  // console.log(FoundTournament)
  res.render("home", {homeStartingContent: homeStartingContent ,Tournament:FoundTournament } )


})

app.get("/about", function(req,res){
  res.render("about", {aboutContent: aboutContent} )

})

app.get("/contact", function(req,res){
  res.render("contact", {contactContent: contactContent} )

})

app.get("/compose", function(req,res){
  res.render("compose")

})

app.post("/compose", function(req,res){
const b= new Blog({
        title:req.body.Title,
        content:req.body.PostBody
    })
// var postData={
//   title:req.body.Title ,
//   postBody : req.body.PostBody
// }
// b.save();
res.redirect("/")
})



app.get('/tournament/:id', async (req, res) => {


  const found = await Tournament.findOne({ name: req.params.id });
const teamIds = found.teams;
const promises = teamIds.map(id => Team.findOne({ _id: id }));
const teamArray = await Promise.all(promises);
teamArray.sort((a, b) => b.points - a.points)

//caluclate the  highest goal scored

let highestScorer = "";
let highestGoals = 0;
for (let i = 0; i < teamArray.length; i++) {
  const found = await Team.findOne({ _id: teamArray[i]._id });
  const playerIds = found.players;
  const promises = playerIds.map(id => Player.findOne({ _id: id }));
  const playerArray = await Promise.all(promises);  
  playerArray.sort((a, b) => b.goals - a.goals)
  var player=playerArray[0];
  

  if (player.goals > highestGoals) {
    highestScorer = player.name;
    highestGoals = player.goals;
  }

 

}


res.render("tournament", {homeStartingContent: "The player with the highest goal scored in "+req.params.id+" Tournament is:"+highestScorer+" with "+highestGoals+" goals" ,Team:teamArray} )

  // console.log(teamarray)
  // res.render("post", {title: found.title, content: found.content});
  // posts.forEach(function(post){
  //   if(req.params.post===post.title){
  //     res.render("post", {title: post.title, content: post.postBody} )

  //   }
  // })
  
})


app.get('/match/:id', async (req, res) => {


  const found = await Tournament.findOne({ name: req.params.id });
const matchIds = found.matches;
const promises = matchIds.map(id => Match.findOne({ _id: id }));
const matchArray = await Promise.all(promises);
matchArray.sort((a, b) => b.Mdate - a.Mdate)
// console.log(matchArray)
res.render("match", {homeStartingContent: req.params.id+" Tournament Matches" ,Match:matchArray } )

  
  
})

app.get('/team/:id', async (req, res) => {


  const found = await Team.findOne({ name: req.params.id });
const playerIds = found.players;
const promises = playerIds.map(id => Player.findOne({ _id: id }));
const playerArray = await Promise.all(promises);
// console.log(playerArray)

playerArray.sort((a, b) => b.goals - a.goals)
//  console.log(playerArray)
res.render("player", {homeStartingContent: req.params.id+" Team Player" ,Player:playerArray , Pname: req.params.id} )

  
  
})

app.post("/request", async function(req,res){
 
var b= new Request({
  Pname:req.body.PlayerName ,
  Tname : req.body.teamName
})
b.save();
 res.redirect("/")

  })
  ////// Admain routs @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  app.post("/login", async function(req,res){
 

    if(req.body.username==="admain@a" &&req.body.password==="12345" ) {
      const FoundRequest = await Request.find({});

      const FoundTournament = await Tournament.find({});
      res.render("AdminHome", {homeStartingContent: homeStartingContent ,Tournament:FoundTournament,Request:  FoundRequest} )
    }
  else{
    res.redirect("/")
  }
  
    })
    app.get("/log", async function(req,res){
 

        const FoundRequest = await Request.find({});
  
        const FoundTournament = await Tournament.find({});
        res.render("AdminHome", {homeStartingContent: homeStartingContent ,Tournament:FoundTournament,Request:  FoundRequest} )
      
    
    
      })
  app.get("/Adelete/:Tname", async function(req,res){
 
    await Tournament.deleteOne({name:req.params.Tname});
    res.redirect("/log")
    
      })


      app.post("/addTournament", async function(req,res){
        const name=req.body.TournamentName;
        createTournament(name,4, 11, 6)
        res.redirect("/log")

        
          })
          app.post("/addTeam", async function(req,res){
            const found = await Tournament.findOne({ name: req.body.TournamentName });
            const team = await createTeam(req.body.TName,11);
            found.teams.push(team);
            await found.save()
            res.redirect("/log")

            
              })
          app.get('/Atournament/:id', async (req, res) => {


            const found = await Tournament.findOne({ name: req.params.id });
          const teamIds = found.teams;
          const promises = teamIds.map(id => Team.findOne({ _id: id }));
          const teamArray = await Promise.all(promises);
          teamArray.sort((a, b) => b.points - a.points)
          
          res.render("AdmainTournament", {homeStartingContent: req.params.id+" Tournament",Team:teamArray,Tournament:req.params.id} )
          
           
          })
              
          app.get("/approve/:Tname/:Pname", async function(req,res){
 
            const found = await Team.findOne({name:req.params.Tname});
            const player = await createPlayer(req.params.Pname);
            found.players.push(player)
            found.save()
            await Request.deleteOne({Tname:req.params.Tname});
            res.redirect("/log")

              })

              app.get('/Ateam/:id', async (req, res) => {


                const found = await Team.findOne({ name: req.params.id });
              const playerIds = found.players;
              const promises = playerIds.map(id => Player.findOne({ _id: id }));
              const playerArray = await Promise.all(promises);
              // console.log(playerArray)
              
              playerArray.sort((a, b) => b.goals - a.goals)
              //  console.log(playerArray)
              res.render("AdmainPlayer", {homeStartingContent: req.params.id+" Team Player" ,Player:playerArray , Pname: req.params.id} )
              
                
                
              })
              app.post("/captain", async function(req,res){
                const found = await Team.findOne({ name: req.body.teamName});
                found.captain=req.body.PlayerName;
                found.save();
                // console.log(req.body.PlayerName)
                // console.log(found.captain)

                 res.redirect("/log")
                
                  })
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

