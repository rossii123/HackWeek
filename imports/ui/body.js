import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Questions} from '../api/questions.js';
import { QuizIndex} from '../api/quizIndex.js'
 
import './body.html';
import './question.html';
import './alternatives.html';
import './countDown.html';
import './phoneScreen.html';
import './phoneScreenAlt.html';
import './charts.html';
import './navbar.html';

Template.question.helpers({
  question(){
    var qIndex = QuizIndex.findOne({id:"qIndex"});
    var obj = Questions.findOne({id:qIndex.currentIndex});
    return obj.question;
      }
});

Template.alternatives.helpers({
  quizInfo(){
    var qIndex = QuizIndex.findOne({id:"qIndex"});
    var obj = Questions.findOne({id:qIndex.currentIndex});

    obj.answer_a = obj.answers[0].text;
    obj.correct_a = obj.answers[0].correct;
    obj.answer_b = obj.answers[1].text;
    obj.correct_b = obj.answers[1].correct;
    obj.answer_c = obj.answers[2].text;
    obj.correct_c = obj.answers[2].correct;
    obj.answer_d = obj.answers[3].text;
    obj.correct_d = obj.answers[3].correct;
    return obj;
      },
      showAnswer() {
        var state = Session.get('state');
        if(state == 1 || state == 2) {
          return "showAnswer";
        } else {
          return "";
        }
      },
      animation() {
        var state = Session.get('state');
        if(state == 1) {
          return "bounce";
        } else {
          return "";
        }
      },

});

Template.alternatives.onCreated(function  () {
   Meteor.subscribe('questions');
   Meteor.subscribe('quizIndex', {
    onReady: function() {

      QuizIndex.find({id:"qIndex"}).observeChanges({
        changed: function(id, fields) {

          if(fields.currentIndex == undefined) {
            var state = fields.state;
            Session.set('state', state);

            if(state == 0) {
              FlowRouter.go("/mainscreen");
            } else if (state == 1) {
            } else if (state == 2) {
              FlowRouter.go("/mainscreencharts");
            }
    }     

    },
  });
    },
   });
});

var Highcharts = require('highcharts/highstock');
Template.charts.helpers({
    createChart: function () {
      // Gather data: 
          var qIndex = QuizIndex.findOne({id:"qIndex"});
          var obj = Questions.findOne({id:qIndex.currentIndex});
          var answers = obj.answers;
          var total_answers = 0;
          for(var i = 0; i < answers.length; i++) {
              total_answers += answers[i].timesGuessed;
          }

            var tasksData = [
            {
                y: answers[0].timesGuessed,
                name: answers[0].text
             }, {
                 y: answers[1].timesGuessed,
                 name: answers[1].text
             }, {
                 y: answers[2].timesGuessed,
                 name: answers[2].text
             }, {
                 y: answers[3].timesGuessed,
                 name: answers[3].text
             }];

      // Use Meteor.defer() to craete chart after DOM is ready:
      Meteor.defer(function() {
        // Create standard Highcharts chart with options:
        Highcharts.chart('chart', {
          title: obj.question,
          series: [{
            type: 'pie',
            data: tasksData
          }]
        });
      });
    }
});
Template.charts.onCreated(function() {
   Meteor.subscribe('questions');
   Meteor.subscribe('quizIndex');
});

Template.phoneScreen.helpers({
  quizInfo(){
    var qIndex = QuizIndex.findOne({id:"qIndex"});
    var obj = Questions.findOne({id:qIndex.currentIndex});

    obj.answer_a = obj.answers[0].text;
    obj.answer_b = obj.answers[1].text;
    obj.answer_c = obj.answers[2].text;
    obj.answer_d = obj.answers[3].text;

    return obj;
      },
      showAnswer() {
        var state = Session.get('state');
        if(state == 1) {
          return "showAnswer";
        } else {
          return "";
        }
      },

  });

Template.phoneScreen.events({
"click": function(event) {
      var target = event.target;
      $(".selected").not(".showAnswer").removeClass("selected");
      $(target).not(".showAnswer").addClass("selected");
}
});

Template.phoneScreen.onCreated(function(){
   Meteor.subscribe('questions');
   Meteor.subscribe('quizIndex', {
    onReady: function() {

      QuizIndex.find({id:"qIndex"}).observeChanges({
        changed: function(id, fields) {

          if(fields.currentIndex == undefined) {
            var state = fields.state;
            Session.set('state', state);

            if(state == 0) {
              FlowRouter.go("/");
            } else if (state == 1) {
              var q = $(".button.selected").val();
              if(q != undefined) {
                Meteor.call("incrementGuesses", q);
              }
              console.log(q);
            } else if (state == 2) {
              FlowRouter.go("/charts");
            }
    }     

    },
  });
    },
   });
});

Template.alternatives.onRendered(function(){
   countdown.start(function() {
    
    Meteor.call("updateState");

    countdown.start();

    var state = Session.get("state");

    if( state == 2) {
    } else if (state == undefined || state == 0) {
      countdown.remove(15);
    } else if (state == 1) {
      countdown.remove(12);
    }
    
});
});

var time_main = 20;
var time_result = 5;
var time_charts = 8;

var countdown = new ReactiveCountdown(time_main, {
	interval: 10,
	steps: 0.01,

});
Template.countDown.helpers({

		getCountdown: function() {
		var time = Math.floor(countdown.get())
	return time; },
		progressNow: function() {
			var time = countdown.get()
			return Math.floor((time / time_main) * 100);
		},
});