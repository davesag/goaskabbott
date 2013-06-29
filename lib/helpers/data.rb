module DataHelper

  # return a list of any 'project_details' items.
  def team_list
    @items.select { |i| i.identifier.start_with? '/team_details/' }
  end

  def questions
    @items.select { |i| i.identifier.start_with? '/question_details/' }
  end

  def json_feed
    require 'json'
    t = team_list.map do |ach|
      {
        :code => ach[:code],
        :twitter => ach[:twitter],
        :firstname => ach[:firstname],
        :surname => ach[:surname],
        :position => ach[:position],
        :email => ach[:email]
      }
    end
    q = questions.map do |ach|
      {
        :question => ach[:question],
        :tweet => ach[:tweet],
        :tags => ach[:tags]
      }
    end
    {:created_at => Time.now.utc,
     :team_count => team_list.size,
     :question_count => questions.size,
     :team => t, :questions => q}.to_json
  end
end
