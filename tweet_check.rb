#!/usr/bin/env ruby

require 'yaml'

begin
  team = YAML.load(File.read('abbotts_team.yml'))
  # puts achievements.inspect
  longest = 0
  lt = nil
  sza = nil
  team.each do |ach|
    sza = ach[:twitter].size
    if sza > longest
      longest = sza
      lt = ach
    end
  end
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
  end
  puts "longest tweet, including tags is #{lt[:tweet]} #{lt[:tags].join(' ')} — #{szb} charaters."
  if sza + szb > 110
    puts "tweet + tags + longest twitter name too long by #{110 - sza - szb} characters."
  else
    puts "all okay"
  end
rescue => e
  puts e.message
  puts e.backtrace
  exit(1)
end
