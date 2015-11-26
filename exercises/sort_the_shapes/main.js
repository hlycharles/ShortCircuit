/**
 * @file Sort the Shapes
 * @Luyao Hou, Abhy Vytheeswaran, Ai Li
 */
var main = function(ex) {

  var falsey_value = ["None", "[]", "0", "\"\""];
  //The current step that is evaluated
  var cur_code = "";
  //The current values that are substituted into general code format
  //  see generate_code for how it is used
  var cur_code_vals = [];
  //keep all code-wells drawn so that it will be easy to remove them
  var codes = [];

  //UI elements
  var instruction = undefined;
  var drop_down = undefined;
  //button that submits user's answer
  var submit_ans_button = undefined;

  /* keep track of current exercise state */
  //The index of correct drop down option
  var correct_op_index = undefined;
  //The index of drop down option that user chooses
  var chosen_op_index = 0;
  //Current stage / step of evaluation
  var cur_stage = 0;
  //Total number of steps / stages
  var total_stage = 0;
  var question_type = 1;

  /* UI variables */
  //small margin
  var s_margin = 10;

  //Generate a random expression that throws an exception
  function generate_exn() {
    return "(1/0)";
  }

  //Generate code according to given format. "F" stands for falsey value, "T" stands for
  //  truthy value and "E" stands for expressions that throw exceptions
  //e.g. format "((T or F) and E)" might give "((1 or []) and (1/0))"
  //In this case, store values "1", "[]", "(1/0)" in cur_code_vals and store the string
  // "((1 or []) and (1/0))" into cur_code
  function generate_code(format) {
    var result = "";
    var result_arr = [];
    for (var i = 0; i < format.length; i++) {
      if (format[i] == "F") {
        var value_index = Math.floor(Math.random() * (falsey_value.length));
        result += falsey_value[value_index];
        result_arr.push(falsey_value[value_index]);
      }else if (format[i] == "T") {
        var int_value = Math.round(Math.random() * 10) + 1;
        result += int_value.toString();
        result_arr.push(int_value.toString());
      }else if (format[i] == "E") {
        var exn_exp = generate_exn();
        result += exn_exp;
        result_arr.push(exn_exp);
      }else {
        result += format[i];
      }
    }
    cur_code = result;
    cur_code_vals = result_arr;
    correct_op_index = 0;
    return;
  }

  //Substitude values in cur_code_vals into format
  //e.g. if cur_code_vals = ["1", "0"], then
  //  format_code("(T and F)") returns "(1 or 0)"
  function format_code(format) {
    var result = "";
    var cur_replace = 0;
    for (var i = 0; i < format.length; i++) {
      if (format[i] == "F" || format[i] == "E" || format[i] == "T") {
        result += cur_code_vals[cur_replace];
        cur_replace++;
      }else {
        result += format[i];
      }
    }
    cur_code = result;
    return;
  }

  //Proceed to the next stage of exercise
  function to_next_stage() {
    if (question_type == 1) {
      switch ((cur_stage)) {
        case 0:
          draw_instruction("Is this value truthy or falsey?");
          cur_stage++;
          draw_drop_down();
          correct_op_index = 0;
          break;
        case 1:
          draw_instruction("Does short-circuit evaluation occur?");
          cur_stage++;
          draw_drop_down();
          correct_op_index = 0;
          break;
        case 2:
          cur_code_vals.splice(1, 1);
          format_code("T or E");
          draw_code(cur_code, 1);
          break;
        default:
          cur_stage++;
          break;
      }
    }
  }

  //Check if user selects the correct answer from drop down
  function check_answer() {
    if (correct_op_index == undefined) {
      ex.showFeedback("Application error");
      return;
    }
    if (correct_op_index == chosen_op_index) {
      to_next_stage();
    }else {
      ex.showFeedback(generate_feedback());
    }
  }

  //@TODO
  //Generate feedback according to error user make
  function generate_feedback() {
    return "TODO";
  }

  function draw_code(code, line) {
    var x = 10;
    var line_height = 80;
    var line_space = 5;
    var code_well = ex.createCode(x, (line_height + line_space) * line + line_space, code, {
      width: "200px",
      language: "python"
    });
    codes.push(code_well);
  }

  function draw_instruction(text) {
    if (instruction != undefined) {
      instruction.remove();
    }
    var x = ex.width() / 2 + s_margin;
    instruction = ex.createParagraph(x, s_margin, text, {
      textAlign: "left",
      size: "large"
    });
  }

  function draw_drop_down() {
    if (drop_down != undefined) {
      drop_down.remove();
    }
    var drop_y = 40;
    if (question_type == 1) {
      switch (cur_stage) {
        case 0:
        //Get around using variables
        var elems = {};
        elems[cur_code_vals[0]] = function() {chosen_op_index = 0};
        elems[cur_code_vals[1]] = function() {chosen_op_index = 1};
        drop_down = ex.createDropdown(s_margin + ex.width() / 2, drop_y, cur_code_vals[0], {
          color: "light-blue",
          elements: elems
        });
          break;
        case 1:
          drop_down = ex.createDropdown(s_margin + ex.width() / 2, drop_y, "Truthy", {
            color: "light-blue",
            elements: {
              Truthy: function() {chosen_op_index = 0},
              Falsey: function() {chosen_op_index = 1}
            }
          })
          break;
        case 2:
          drop_down = ex.createDropdown(s_margin + ex.width() / 2, drop_y, "Yes", {
            color: "light-blue",
            elements: {
              Yes: function() {chosen_op_index = 0},
              No: function() {chosen_op_index = 1}
            }
          })
          break;
        default:
          break;
      }
    }
  }

  //Draw the button that user clicks to submit their answer
  function draw_submit_ans_button() {
    var button_y = 80;
    submit_ans_button = ex.createButton(ex.width() / 2 + s_margin, button_y, "Submit", {
      color: "lightBlue",
      size: "medium"
    });
    submit_ans_button.on("click", function(){check_answer();});
  }

  //Draw question, which includes instruction, drop down and submit button
  function draw_question(type) {
    if (type == "nextEval") {
      draw_instruction("Which expression is evaluated next?");
      draw_drop_down();
      draw_submit_ans_button();
    }
  }

  //@Should be changed so that the initial question is about truth table
  function initialize() {
    generate_code("(T or F) or E)");
    draw_code(cur_code, 0);
    draw_question("nextEval");
  }

  initialize();

}
