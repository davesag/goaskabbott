var $question, $team, $comm, $summary, $send;

function Question(a_question, a_tweet, some_tags) {
  this.question = a_question;
  this.tweet = a_tweet;
  this.tags = some_tags;
  this.tags.push('gaa');
  Question.all.push(this);
}
Question.all = [];
function TeamMember(a_code, a_firstname, a_surname, a_position, a_twitter, an_email) {
  this.code = a_code;
  this.firstname = a_firstname;
  this.surname = a_surname;
  this.position = a_position;
  this.twitter = a_twitter;
  this.email = an_email;
  TeamMember.all[this.code] = this;
}
TeamMember.all = {};

function to_email(a_question, a_person) {
  return  'Dear ' + ((a_person.position === 'senator') ? 'Senator' : 'Minister')
        + ' ' + a_person.surname
        + ',\n\n'
        + 'In the event that the coalition wins the forthcoming election, I have the following question.\n\n'
        + a_question.question
        + '\n\nYours sincerely\n\n{your name here}';
}

function no_twitter(a_person) {
  return ((a_person.position === 'senator') ? 'Senator' : 'Minister') + ' '
          + a_person.firstname + ' ' + a_person.surname + ' has no twitter id.';
}

function send_tweet(a_question, a_person) {
  var message = "https://twitter.com/intent/tweet?screen_name=@"
              + a_person.twitter
              + "&text=" + a_question.tweet
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

function update_summary() {
  var qv = parseInt($question.val()),
      tv = $team.val(),
      cv = $comm.val(),
      q = (qv >= 0) ? Question.all[qv] : null,
      t = (tv !== '') ? TeamMember.all[tv] : null;
  console.log('Update using', qv, tv, cv);
  console.log('Update with', q, t, cv);
  if ((q === null) || (t === null)) {
    $summary.addClass('alert-info').removeClass('alert-success alert-error');
    $send.addClass('disabled');
  } else {
    if (t.twitter === 'unavailable' && cv === 'tweet') {
      $summary.addClass('alert-error').removeClass('alert-success alert-info');
      $summary.html(no_twitter(t));
      $send.addClass('disabled');
    } else {
      $summary.removeClass('alert-info alert-error').addClass('alert-success');
      $send.removeClass('disabled');
      if ($comm.val() === 'tweet') {
        var hashtags = [];
        for (var i in q.tags) {
          hashtags.push('#' + q.tags[i]);
        }
        $summary.html('@' + t.twitter + ' ' + q.tweet
                      + ' ' + hashtags.join(' '));
      } else {
        $summary.html('<pre>to: ' + t.email + '\n\n' + to_email(q, t) + '</pre>');
      }
    }
  }
}

$(document).ready(function() {
  $("label").css('font-weight', 'bold');
  $question = $("#question");
  $team = $("#for-whom");
  $comm = $("#comm-type");
  $summary = $("#summary");
  $send = $("#send");
  var i, qi, q;
  $.get('/api.json', function(data) {
    for (i in data.questions) {
      qi = data.questions[i];
      qu = new Question(qi.question, qi.tweet, qi.tags);
      $question.append("<option value='" + i + "'>" + qi.tweet + "</option>");
    }
    for (i in data.team) {
      qi = data.team[i];
      qu = new TeamMember(qi.code, qi.firstname, qi.surname, qi.position, qi.twitter, qi.email);
      $team.append("<option value='" + qi.code + "'>" + qi.firstname + ' ' + qi.surname +  "</option>");
    }
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