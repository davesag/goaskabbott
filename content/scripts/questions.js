var $question, $team, $comm, $summary, $send, $info,
    INCOMPLETE = 0, NO_TWEET = 1, OK = 2;

function Question(a_question, a_tweet, some_tags) {
  this.question = a_question;
  this.tweet = a_tweet;
  this.tags = some_tags;
  this.tags.push('gaa');
  this.hashtags = [];  for (var i in this.tags) this.hashtags.push('#' + this.tags[i]);
  Question.all.push(this);
}
Question.all = [];
function TeamMember(a_code, a_firstname, a_surname, a_sex, a_position, some_roles, a_twitter, an_email) {
  this.code = a_code;
  this.firstname = a_firstname;
  this.surname = a_surname;
  this.sex = a_sex;
  this.position = a_position;
  this.roles = some_roles;
  this.twitter = a_twitter;
  this.email = an_email;
  TeamMember.all[this.code] = this;
  this.address = function() {
    if (this.position === 'senator') return 'Dear Senator ' + this.surname;
    return 'Dear ' + this.honorific();
  }
  this.honorific = function() {
    return ((this.sex === 'male') ? 'Mr' : 'Ms') + ' ' + this.surname;
  }
  this.fullname = function() {
    return this.firstname + ' ' + this.surname;
  }
  this.no_twitter = function() {
    return (this.twitter === 'unavailable');
  }
}
TeamMember.all = {};

function to_email(a_question, a_person) {
  return  a_person.address()
        + ',\n\n'
        + 'I write to you in regards to your role'
        + ((a_person.roles.length >1) ? 's' : '')
        + ' as '
        + a_person.roles.join(', and ') + '.\n\n'
        + a_question.question
        + '\n\nYours faithfully\n\n{replace this with your name}';
}

function no_twitter(a_person) {
  return a_person.honorific() + ' has no twitter id.';
}

function send_tweet(a_question, a_person) {
  var message = "https://twitter.com/intent/tweet?screen_name=@"
              + a_person.twitter
              + "&text=" + encodeURIComponent(a_question.tweet + ' http://goaskabbott.com')
              + "&hashtags=" + a_question.tags.join(',');
  window.open(message, "Send Tweet", "height=420,width=550");
}

function send_email(a_question, a_person) {
  var message = 'mailto:' + encodeURIComponent(a_person.email)
              + '?subject=' + encodeURIComponent(a_question.tweet)
              + '&body=' + encodeURIComponent(to_email(a_question, a_person));
  console.log(message);
  window.open(message);
}

function summary_info_text(state) {
  if (state === NO_TWEET) return 'Please choose a different person or communication type';
  return 'A new ' + $comm.val() + ' will be created externally to this page which you may edit and send';
}

function update_summary_status(state, q, t) {
  switch(state) {
    case INCOMPLETE:
      $summary.addClass('alert-info').removeClass('alert-success alert-error');
      $send.addClass('disabled');
      $summary.html('');
      $info.addClass('muted').removeClass('alert-success alert-error');
      $info.html(summary_info_text(state));
      break;

    case NO_TWEET:
      $summary.addClass('alert-error').removeClass('alert-success alert-info');
      $summary.html(no_twitter(t));
      $send.addClass('disabled');
      $info.addClass('alert-error').removeClass('alert-success muted');
      $info.html(summary_info_text(state));
      break;

    case OK:
      $summary.removeClass('alert-info alert-error').addClass('alert-success');
      $send.removeClass('disabled');
      if ($comm.val() === 'tweet') {
        $summary.html('@' + t.twitter + ' ' + q.tweet
                      + ' http://goaskabbott.com ' + q.hashtags.join(' '));
      } else {
        $summary.html('<pre>to: ' + t.email + '\n\n' + to_email(q, t) + '</pre>');
      }
      $info.addClass('alert-success').removeClass('alert-error muted');
      $info.html(summary_info_text(state));
      break;
  }
}

function update_summary() {
  var qv = parseInt($question.val()),
      tv = $team.val(),
      cv = $comm.val(),
      q = (qv >= 0) ? Question.all[qv] : null,
      t = (tv !== '') ? TeamMember.all[tv] : null;
  if ((q === null) || (t === null)) update_summary_status(INCOMPLETE, q, t)
  else if (t.no_twitter() && cv === 'tweet') update_summary_status(NO_TWEET, q, t)
  else update_summary_status(OK, q, t);
}

$(document).ready(function() {
  $("label").css('font-weight', 'bold');
  $question = $("#question");
  $team = $("#for-whom");
  $comm = $("#comm-type");
  $summary = $("#summary");
  $send = $("#send");
  $info = $("#info");
  var i, qi, q, jdata;
  $.get('/api.json', function(data) {
    if (typeof data === 'string') jdata = $.parseJSON(data)
    else jdata = data;
    for (i in jdata.questions) {
      qi = jdata.questions[i];
      qu = new Question(qi.question, qi.tweet, qi.tags);
      $question.append("<option value='" + i + "'>" + qi.tweet + "</option>");
    }
    for (i in jdata.team) {
      qi = jdata.team[i];
      qu = new TeamMember(qi.code, qi.firstname, qi.surname, qi.sex, qi.position, qi.roles, qi.twitter, qi.email);
      $team.append("<option value='" + qu.code + "'>" + qu.fullname() + " (" + qu.roles.join(', ') + ")</option>");
    }
    update_summary();
  }).error(function(err){
    console.log("error", err);
  });
  $("select").change(function(event) {
    update_summary()
  });
  $send.click(function(event) {
    var qv = parseInt($question.val()),
        tv = $team.val(),
        cv = $comm.val(),
        q = (qv >= 0) ? Question.all[qv] : null,
        t = (tv !== '') ? TeamMember.all[tv] : null;
    if ($comm.val() === 'tweet') send_tweet(q,t)
    else send_email(q,t);
  });
});
