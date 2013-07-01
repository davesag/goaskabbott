var $question, $team, $comm, $summary, $send, $info, $you,
    INCOMPLETE = 0, NO_TWEET = 1, OK = 2,
    TICK = '\u2713';

function rot13(s) {
  return (s ? s : this).split('').map(function(es) {
    if (!es.match(/[A-za-z]/)) return es;
    c = Math.floor(es.charCodeAt(0) / 97);
    k = (es.toLowerCase().charCodeAt(0) - 83) % 26 || 26;
    return String.fromCharCode(k + ((c == 0) ? 64 : 96));
  }).join('');
}

function TagIndex(tag) {
  this.tag = tag;
  this.questions = [];
  this.team_members = [];
  TagIndex.all[tag] = this;
}
TagIndex.all = {};
TagIndex.add_question = function(q) {
  var t, ti, i;
  for (i in q.tags) {
    t = q.tags[i];
    ti = TagIndex.all[t];
    if (ti === null || typeof ti === 'undefined') ti = new TagIndex(t);
    if (ti.questions.indexOf(q.code) === -1) ti.questions.push(q.code);
  }
}
TagIndex.add_team_member = function(tm) {
  var t, ti, i;
  for (i in tm.tags) {
    t = tm.tags[i];
    ti = TagIndex.all[t];
    if (ti === null || typeof ti === 'undefined') ti = new TagIndex(t);
    if (ti.team_members.indexOf(tm.code) === -1) ti.team_members.push(tm.code);
  }
}
TagIndex.get_matching_team_codes = function(q) {
  var result = [], i, t, ti, tm, tms;
  for (i in q.tags) {
    t = q.tags[i];
    ti = TagIndex.all[t];
    for (tms in ti.team_members) {
      tm = ti.team_members[tms];
      if (result.indexOf(tm) === -1) result.push(tm);
    }
  }
  return result;
}

function Question(a_code, a_question, a_tweet, some_tags) {
  this.code = a_code;
  this.question = a_question;
  this.tweet = a_tweet;
  this.tags = some_tags;
  this.tags.push('gaa');
  this.hashtags = [];  for (var i in this.tags) this.hashtags.push('#' + this.tags[i]);
  Question.all[this.code] = this;
  TagIndex.add_question(this);
}
Question.all = {};
function TeamMember(a_code, a_firstname, a_surname, a_sex, a_position, some_roles, a_twitter, an_email, some_tags) {
  this.code = a_code;
  this.firstname = a_firstname;
  this.surname = a_surname;
  this.sex = a_sex;
  this.position = a_position;
  this.roles = some_roles;
  this.twitter = a_twitter;
  this.email = an_email;
  this.tags = some_tags
  TeamMember.all[this.code] = this;
  TagIndex.add_team_member(this);
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

function personalise(text, who) {
  var pn = who.fullname(), qt = text;
  if (qt.indexOf(pn) >= 0) qt = qt.replace(pn, 'you');
  return qt;
}

function to_email(a_question, a_person) {
  return  a_person.address()
        + ',\n\n'
        + 'I write to you in regards to your role'
        + ((a_person.roles.length >1) ? 's' : '')
        + ' as '
        + a_person.roles.join(', and ') + '.\n\n'
        + personalise(a_question.question, a_person)
        + '\n\nYours faithfully\n\n' + $you.val();
}

function no_twitter(a_person) {
  return a_person.honorific() + ' has no twitter id.';
}

function send_tweet(a_question, a_person) {
  var message = "https://twitter.com/intent/tweet?screen_name=@"
              + a_person.twitter
              + "&text=" + encodeURIComponent(personalise(a_question.tweet, a_person) + ' http://goaskabbott.com')
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
  if ($comm.val() === 'tweet') return 'A new tweet will be created via twitter.com which you may edit and send';
  return 'A new email will be created in your default email client, which you may edit and send';
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
        $summary.html('@' + t.twitter + ' ' + personalise(q.tweet, t)
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
  var qv = $question.val(),
      tv = $team.val(),
      cv = $comm.val(),
      yv = $you.val(),
      options = $team.find('option'),
      q = (qv !== '') ? Question.all[qv] : null,
      t = (tv !== '') ? TeamMember.all[tv] : null,
      team_match, opt, opt_text;
  options.each(function(i,o) {
    if (i === 0) return;
    opt = $(o);
    opt_text = opt.text();
    if (opt_text.indexOf(TICK) == 0) opt.text(opt_text.substring(2));
    opt.removeClass('tags-match');
  });
  if ((q === null) || (t === null) || (yv === '' && cv === 'email')) update_summary_status(INCOMPLETE, q, t)
  else if (t.no_twitter() && cv === 'tweet') update_summary_status(NO_TWEET, q, t)
  else update_summary_status(OK, q, t);
  if (cv === 'tweet') $you.parent().hide()
  else $you.parent().show();
  if (q !== null) {
    team_match = TagIndex.get_matching_team_codes(q);
    options.each(function(i, o) {
      if (i === 0) return;
      opt = $(o);
      if (team_match.indexOf(opt.val()) !== -1) {
        opt.addClass('tags-match');
        opt.text(TICK + ' ' + opt.text());
      }
    });
  }
}

$(document).ready(function() {
  $("label").css('font-weight', 'bold');
  $question = $("#question");
  $team = $("#for-whom");
  $comm = $("#comm-type");
  $summary = $("#summary");
  $send = $("#send");
  $info = $("#info");
  $you = $("#your-name");
  var i, qi, q, jdata, saved_name = $.cookie('gaa_n');
  if (saved_name != null && saved_name !== '') $you.val(rot13(saved_name));
  $.get('/api.json', function(data) {
    if (typeof data === 'string') jdata = $.parseJSON(data)
    else jdata = data;
    for (i in jdata.questions) {
      qi = jdata.questions[i];
      qu = new Question(qi.code, qi.question, qi.tweet, qi.tags);
      $question.append("<option value='" + qu.code + "'>" + qu.tweet + "</option>");
    }
    for (i in jdata.team) {
      qi = jdata.team[i];
      qu = new TeamMember(qi.code, qi.firstname, qi.surname, qi.sex, qi.position, qi.roles, qi.twitter, qi.email, qi.tags);
      $team.append("<option value='" + qu.code + "'>" + qu.fullname() + " (" + qu.roles.join(', ') + ")</option>");
    }
    update_summary();
  }).error(function(err){
    console.log("error", err);
  });
  $("select, input").change(function(event) {
    update_summary()
  });
  $send.click(function(event) {
    var qv = parseInt($question.val()),
        tv = $team.val(),
        cv = $comm.val(),
        q = (qv >= 0) ? Question.all[qv] : null,
        t = (tv !== '') ? TeamMember.all[tv] : null;
    if ($you.val() !== '') $.cookie('gaa_n', rot13($you.val()))
    else $.removeCookie('gaa_n');
    if ($comm.val() === 'tweet') send_tweet(q,t)
    else send_email(q,t);
  });
});
