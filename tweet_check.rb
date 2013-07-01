#!/usr/bin/env ruby

require 'yaml'

begin
  team = YAML.load(File.read('abbotts_team.yml'))
  # puts achievements.inspect
  longest = 0
  lt = nil
  sza = nil
  all_tags = []
  team.each do |ach|
    sza = ach[:twitter].size
    if sza > longest
      longest = sza
      lt = ach
    end
  end
  sza = longest
  puts "longest twitter handle is #{lt[:twitter]} — #{sza} charaters."
  questions = YAML.load(File.read('questions.yml'))
  # puts achievements.inspect
  longest = 0
  szb = nil
  questions.each do |ach|
    szb = ach[:tweet].size + ach[:tags].size + ach[:tags].join(' ').size + 2
    if szb > longest
      longest = szb
      lt = ach
    end
    all_tags = all_tags | ach[:tags]
  end
  szb = longest
  puts "longest tweet, including tags is #{lt[:tweet]} #{lt[:tags].join(' ')} — #{szb} charaters."
  extra_chars = ' http://goaskabbott.com #gaa '.size
  if sza + szb + extra_chars > 140
    puts "tweet + tags + longest twitter name too long by #{140 - sza - szb - extra_chars} characters."
  else
    puts "all okay"
  end
  puts all_tags.sort.join(', ')
rescue => e
  puts e.message
  puts e.backtrace
  exit(1)
end
