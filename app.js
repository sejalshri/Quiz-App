const express = require("express");
const ejs = require("ejs");
const path =  require("path");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({
	extended:true
}))
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

app.use(express.static("public/"));
app.use(express.urlencoded({ extended: true }));

const categories=[];
const ids=[];

https.get("https://opentdb.com/api_category.php",function(response){
		response.on("data",function(data){
		const result=JSON.parse(data);
		result.trivia_categories.forEach(function(item){
			categories.push(item.name);
			ids.push(item.id)
		});
	})
})
app.get("/",function(req,res){
	res.render("home",{categories:categories,id:ids});
})

app.post("/:id",function(req,res){
	var id=req.params.id;
	https.get("https://opentdb.com/api.php?amount=10&category="+id.toString(),function(response){
		response.on("data",function(data){
			const result=JSON.parse(data);
			const list=[];
			result.results.forEach(function(item){
				const questions={
					question:item.question,
					answers: shuffle(item.incorrect_answers.concat(item.correct_answer)),
					correct:item.correct_answer
				}
				list.push(questions);
			});
			res.render("start",{list:list});
	})
	})

})

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array;
}

app.listen(process.env.PORT || 3000, function (req, res) {
  console.log("Server started at port 3000");
});