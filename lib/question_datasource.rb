require 'digest'

class QuestionsDataSource < Nanoc::DataSource
  identifier :questions
  # (other code here) - see http://nanoc.ws/docs/extending-nanoc/
  attr_reader :questions

  def up
    # read in the data from the projects.yml file
    raise RuntimeError, "Could not file './questions.yml'" unless File.exists?('./questions.yml')
    @questions = YAML.load(File.read('./questions.yml'))
  end

  def items
    dig = Digest::SHA256.new
    @questions.map do |ach|
      code = (dig << ach[:question]).to_s
      Nanoc3::Item.new(
        code,
        {
          :question => ach[:question],
          :tweet => ach[:tweet],
          :tags => ach[:tags]
        },
        "/question_details/#{code}",
        {:binary => false}
      )
    end
  end
end
