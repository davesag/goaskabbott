class TeamDataSource < Nanoc::DataSource
  identifier :team
  # (other code here) - see http://nanoc.ws/docs/extending-nanoc/
  attr_reader :team_list

  def up
    # read in the data from the projects.yml file
    raise RuntimeError, "Could not file './abbotts_team.yml'" unless File.exists?('./abbotts_team.yml')
    @team_list = YAML.load(File.read('./abbotts_team.yml'))
    # puts @team_list
  end

  def items
    @team_list.map do |ach|
      code = "#{ach[:firstname]}#{ach[:surname]}".downcase.gsub(/ /, '')
      Nanoc3::Item.new(
        code,
        {
          :code => code,
          :firstname => ach[:firstname],
          :surname => ach[:surname],
          :position => ach[:position],
          :twitter => ach[:twitter],
          :email => ach[:email]
        },
        "/team_details/#{code}",
        {:binary => false}
      )
    end
  end
end
