/**
 * @file Short-circuit Evaluation
 * @Luyao Hou, Abhy Vytheeswaran, Ai Li
 */
var main = function(ex) {

  var falsey_value = ["None", "[]", "0", "\"\""];
  // Options for truth tables
  var a_options=["A", "T", "T", "F", "F"];
  var b_options=["B", "1", "0", "1", "0"];
  var or_result=["A or B", "T", "T", "1", "0"];
  var and_result=["A and B", "1", "0", "F", "F"];
  // For possible future implementation of De Morgan's Law
  var nand = ["not (A and B)", "F", "T", "T", "T"]
  var nand_equiv=["(not A) or (not B)", "F", "T", "T", "T"]
  var nor = ["not (A or B)","F", "F", "F", "T"]
  var nor_equiv=["(not A) and (not B)", "F", "F", "F", "T"]

  //Possible formats of questions
  var stage_one = ["(T and F)", "(T or F)", "(F and T)", "(F or T)"];
  var stage_two = ["((T and F) and T)", "((T or F) and T)",
                   "((F and T) or T)", "((F or T) and T)",
                   "((T and T) or F)", "((F or F) and T)"]
  var stage_three = ["(((T and F) or T) and T)", "(((F or T) or T) and F)",
                     "(((T or F) and T) or F)", "(((F and T) or T) and F)"];
  var stages = [stage_one, stage_two, stage_three];
  var cur_stage = 0;

  //The current step that is evaluated
  var cur_code = "";
  //The current values that are substituted into general code format
  //  see generate_code for how it is used
  var cur_code_vals = [];
  //keep all code-wells drawn so that it will be easy to remove them
  var codes = [];
  var code_hist = [];
  var code_val_hist = [];
  //Current level of codes drawn
  var code_level = 0;

  //UI elements
  var instruction = undefined;
  var drop_down = undefined;
  var ans_button1 = undefined;
  var ans_button2 = undefined;
  //button that submits user's answer
  var submit_ans_button = undefined;
  //next_stage button
  var next_stage_btn = undefined;
  //header of question label
  var question_hdr = undefined;
  //Number of question currently taken
  var question_num_label = undefined;
  var draw_alert = true;
  var ins_alert = undefined;

  /* keep track of current exercise state */
  //The index of correct drop down option
  var correct_op_index = undefined;
  //The index of drop down option that user chooses
  var chosen_op_index = 0;
  //Current stage / step of evaluation
  var cur_step = 0;
  //Total number of steps / stages
  var total_stage = 0;
  var question_type = 1;

  /* UI variables */
  //small margin
  var s_margin = 10;
  //button width
  var btn_width = 100;
  //offset for question number header
  var question_hdr_offset = 0;

  /* paragraph elements */
  var text_list=[];

  //Get and set mode
  var mode = ex.data.meta.mode;
  mode = "quiz-immediate";

  //Flag for stable local testing
  var not_on_server = 0;

  //specifically for save state
  var in_truth_table = true;
  var ins_str = "NEWSTR";
  var btn_vals = [];
  var task_finished = false;
  var submitted = false;

  ex.data.content = {
  };

  function draw_truth_tables(type){
    if(type=="or"){
      var x=(ex.width()/2) - 200;
      var y=(ex.height()/2) - 150;
    }
    else{
      var x=(ex.width()/2)+50;
      var y=(ex.height()/2)-150;
    }
  }

  function draw_truth_tables(type, x, y){
    ex.graphics.ctx.strokeRect(x, y, 150, 250);
    var margin= 50;

    //Draw instruction
    var ins = "Before taking the exercise, "
    ins = ins.concat("make sure that you are familiar with the truth table. ");
    ins = ins.concat("The highlighted blocks are where short-circuiting occurs.");
    ins = ins.concat(" Click \"next\" to continue");
    if (in_truth_table && draw_alert) {
      ins_alert = ex.alert(ins, {stay: true});
      draw_alert = false;
    }
    /*
    var text = ex.createParagraph(s_margin, s_margin, ins, {
        size: "medium",
        width: ex.width()
      });
    text_list.push(text);
    var text2 = ex.createParagraph(s_margin, ex.height() - margin,
      "Click 'next' to continue", {
        size: "medium"
      });
    text_list.push(text2);
    */

    //draw vertical lines
    for(var i=0; i<2; i++){
      ex.graphics.ctx.moveTo(x+margin,y);
      ex.graphics.ctx.lineTo(x+margin,y+250);
      ex.graphics.ctx.stroke();
      margin+=50;
    }
    //draw horizontal lines
    margin=50;
    var curCol=a_options;
    for(i=0; i<5; i++){
      var text_margin=50;
      var align=3;
      var text_size="large";
      ex.graphics.ctx.moveTo(x,y+margin);
      ex.graphics.ctx.lineTo(x+150,y+margin);
      ex.graphics.ctx.stroke();

      //highlight short circuited

      //draw text
      for(var j=0; j<3; j++){
        if(j==0){
          curCol=a_options;
          //highlight
          if((i==2 || i==3) && (type=="and")){
            ex.graphics.ctx.globalAlpha=0.4;
            ex.graphics.ctx.fillStyle="yellow";
            ex.graphics.ctx.fillRect(x+100, y+margin, 50, 50);
            ex.graphics.ctx.globalAlpha=1;
          }
          if((i==0 || i==1) && (type=="or")){
            ex.graphics.ctx.globalAlpha=0.4;
            ex.graphics.ctx.fillStyle="yellow";
            ex.graphics.ctx.fillRect(x+100, y+margin, 50, 50);
            ex.graphics.ctx.globalAlpha=1;
          }
        }
        else if(j==1){
          curCol=b_options;
        }
        else {
          if(type=="or"){
            curCol=or_result;
            if(i==0){
              text_size="medium";
              align=17;
            }
          }
          else if(type=="and"){
            curCol=and_result;
            if(i==0){
              text_size="small";
              align=17;
            }
          }
        }
        var text = ex.createParagraph(x+text_margin/2-align,y+margin-35,curCol[i],
                                {size: text_size});
        text_list.push(text);
        text_margin+=100;
      }
      margin+=50;
    }
  }

  function remove_truth_table() {
    ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
    for(var i=0; i<text_list.length; i++){
      text_list[i].remove();
    }
  }

  //Get a random format from current stage
  function get_format() {
    var cur_step_formats = stages[cur_stage];
    var format_len = cur_step_formats.length;
    var format_index = Math.floor(Math.random() * format_len);
    return cur_step_formats[format_index];
  }

  //Generate a random expression that throws an exception
  function generate_exn() {
    var possible_exn = ["(1/0)", "(2/0)", "(3/0)", "(8/0)"];
    var index = Math.floor(Math.random() * possible_exn.length);
    return possible_exn[index];
  }

  //Generate code according to given format. "F" stands for falsey value, "T"
  //  stands for truthy value and "E" stands for expressions that
  //  throw exceptions
  //e.g. format "((T or F) and E)" might give "((1 or []) and (1/0))"
  //In this case, store values "1", "[]", "(1/0)" in cur_code_vals and store
  //the string "((1 or []) and (1/0))" into cur_code
  function generate_code(format) {
    var result = "";
    var result_arr = [];
    var already_used = [];
    for (var i = 0; i < format.length; i++) {
      if (format[i] == "F") {
        var value_index = Math.floor(Math.random() * (falsey_value.length));
        var temp_choice = falsey_value[value_index];
        while (already_used.indexOf(temp_choice) != -1) {
          value_index = Math.floor(Math.random() * (falsey_value.length));
          temp_choice = falsey_value[value_index];
        }
        result += temp_choice;
        result_arr.push(temp_choice);
        already_used.push(temp_choice);
      }else if (format[i] == "T") {
        var int_value = Math.round(Math.random() * 10) + 1;
        var temp_choice = int_value.toString();
        while (already_used.indexOf(temp_choice) != -1) {
          int_value = Math.round(Math.random() * 10) + 1;
          temp_choice = int_value.toString();
        }
        result += temp_choice;
        result_arr.push(temp_choice);
        already_used.push(temp_choice);
      }else if (format[i] == "E") {
        var exn_exp = generate_exn();
        while (already_used.indexOf(exn_exp) != -1) {
          exn_exp = generate_exn();
        }
        result += exn_exp;
        result_arr.push(exn_exp);
        already_used.push(exn_exp);
      }else {
        result += format[i];
      }
    }
    cur_code = format;
    cur_code_vals = result_arr;
    code_hist.push(cur_code);
    code_val_hist.push(cur_code_vals.slice());
    correct_op_index = 0;
    return;
  }

  //Substitude values in cur_code_vals into format
  //e.g. if cur_code_vals = ["1", "0"], then
  //  format_code(["(T and F)"]) returns ["(1 and 0)"]
  function format_code(formats) {
    var cur_replace = 0;
    for (var i = 0; i < formats.length; i++) {
      var result = "";
      var format = formats[i];
      for (var j = 0; j < format.length; j++) {
        if (format[j] == "F" || format[j] == "E" || format[j] == "T") {
          result += cur_code_vals[cur_replace];
          cur_replace++;
        }else {
          result += format[j];
        }
      }
      formats[i] = result;
    }
    return formats;
  }

  //Return the index of first operator in format
  function find_op(format) {
    for (var i = 0; i < format.length; i++) {
      if (format[i] == "o" && (i + 1) < format.length && format[i + 1] == "r") {
        return i;
      }else if(format[i] == "a" && (i + 2) < format.length &&
               format[i + 1] == "n" && format[i + 2] == "d") {
        return i;
      }
    }
    return -1;
  }

  //Find the next expression that is after index value stored in 'start'
  function find_next_exp(format, start) {
    var left_count = 0;
    while (format[start] != " ") {
      start++;
    }
    start++;
    var start_index = start;
    if (format[start] != "(") {
      return [start, start];
    }
    left_count++;
    while (left_count != 0) {
      start++;
      if (format[start] == "(") {
        left_count++;
      }else if (format[start] == ")") {
        left_count--;
      }
    }
    var end_index = start;
    return [start_index, end_index];
  }

  //Extract operator out of a format
  function get_op(format) {
    var index = find_op(format);
    if (format[index] == "o") {
      return "or";
    }
    return "and";
  }

  //Get the left and right hand expression of a height 0 expression
  function get_left_right(exp) {
    var first_space = exp.search(" ");
    var left = exp.substring(1, first_space);
    var remaining = exp.substring(first_space + 1, exp.length);
    var second_space = remaining.search(" ");
    var right = remaining.substring(second_space + 1, remaining.length - 1);
    return [left, right];
  }

  function get_peak_format(format) {
    if (height(format) == 1) {
      return format;
    }
    var indices = find_peak(format);
    return format.substring(indices[0], indices[1] + 1);
  }

  //Get peak of format in string representation
  function get_peak_str(format) {
    var peak_format = get_peak_format(format);
    var val_sub = format_code([peak_format]);
    return val_sub[0];
  }

  //Check if the exercise has finished
  function is_finished(format) {
    var formatter_count = 0;
    //assume there is at least 1 T, F or E in format
    for (var i = 0; i < format.length; i++) {
      if (format[i] == "T" || format[i] == "F" || format[i] == "E") {
        formatter_count++;
      }
      if (formatter_count > 1) {
        return false;
      }
    }
    if (formatter_count == 1) {
      return true;
    }
    return undefined;
  }

  function next_step_wrapper(ins, correct_op) {
    draw_instruction (ins);
    draw_choice_btn();
    correct_op_index = correct_op;
  }

  //Proceed to the next step of evaluation
  function to_next_step() {
    if (question_type == 1) {
      switch ((cur_step)) {
        case 0:
          ins_str = "Which part of code is going to be evaluated?"
          next_step_wrapper(ins_str, 0);
          cur_step++;
          break;
        case 1:
          var peak_form = get_peak_format(cur_code);
          var left_right = get_left_right(peak_form);
          var correct_option = 0;
          //If the first operand is not truthy
          if (left_right[0] != "T") {
            correct_option = 1;
          }
          ins_str = "Is ".concat(cur_code_vals[0].concat(" truthy or falsey?"));
          next_step_wrapper(ins_str, correct_option);
          cur_step++;
          break;
        case 2:
          ins_str = "Is there short-circuit evaluation in ";
          ins_str = ins_str.concat(get_peak_str(cur_code).concat("?"));
          var peak_form = get_peak_format(cur_code);
          var op_index = find_op(peak_form);
          var left = peak_form.substring(1, op_index - 1);
          var right = find_next_exp(peak_form, op_index);
          var is_short_circuit = false;
          var operator = "or";
          if (peak_form[op_index] == "a") {
            operator = "and";
          }
          if (get_result(left, right, operator) == "L") {
            is_short_circuit = true;
          }
          if (is_short_circuit) {
            next_step_wrapper(ins_str, 0);
            //Skip the question about second argument
            cur_step = 4;
          }else {
            next_step_wrapper(ins_str, 1);
            cur_step += 2;
          }
          break;
        case 3:
          var peak_form = get_peak_format(cur_code);
          var left_right = get_left_right(peak_form);
          var correct_option = 0;
          //If the second operand is not truthy
          if (left_right[1] != "T") {
            correct_option = 1;
          }
          ins_str = "Is ".concat(cur_code_vals[1].concat(" truthy or falsey?"));
          next_step_wrapper(ins_str, correct_option);
          cur_step++;
          break;
        case 4:
          var peak_str = get_peak_str(cur_code);
          var peak_form = get_peak_format(cur_code);
          var left_right = get_left_right(peak_form);
          var operator = get_op(peak_form);
          var correct_option = 0;
          //Case where the code evaluates to the value on the right
          if (get_result(left_right[0], left_right[1], operator) == "R") {
            correct_option = 1;
          }
          ins_str = "What does ";
          ins_str = ins_str.concat(peak_str).concat(" evaluate to?");
          next_step_wrapper(ins_str, correct_option);
          cur_step++;
          break;
        case 5:
          //case where a new level of code starts
          var peak_form = get_peak_format(cur_code);
          var operator = get_op(peak_form);
          var left_right = get_left_right(peak_form);
          //The expression evaluates to value on the left
          if (get_result(left_right[0], left_right[1], operator) == "L") {
            cur_code_vals.splice(1, 1);
            //The expression evaluates to value on the right
          }else {
            cur_code_vals.splice(0, 1);
          }
          //@TODO This is kind of an ad hoc way of detecting task finish
          //  condition
          var prev_code = cur_code;
          cur_code = eval(cur_code);
          if (cur_code.length == prev_code.length) {
            cur_code = eval(cur_code.substring(1, cur_code.length - 1));
          }
          code_hist.push(cur_code);
          code_val_hist.push(cur_code_vals.slice());
          //save_state();
          var code_val = format_code([cur_code]);
          code_level++;
          draw_code(code_val[0], code_level);
          if (is_finished(cur_code)) {
            //Clear other UI elements
            remove_btn(ans_button1);
            remove_btn(ans_button2);
            //submit_ans_button.remove();
            if (cur_stage < stages.length - 1) {
              ins_str = "Click button below to go to next question";
              draw_instruction(ins_str);
              draw_next_btn();
              break;
            }
            ins_str = "Congratulations, you have completed this exercise. \n";
            draw_instruction(ins_str);
            submit_task();
            task_finished = true;
            break;
          }
          cur_step = 0;
          to_next_step();
          break;
        default:
          break;
      }
      save_state();
    }
  }

  //Remove button from screen if present
  function remove_btn(btn) {
    if (btn != undefined) {
      btn.remove();
      btn = undefined;
    }
  }

  //initialize a question
  function init_question() {
    var format = get_format();
    generate_code(format);
    draw_code(format_code([format])[0], 0);
    to_next_step();
    question_num_label.remove();
    var text_height = 20;
    //Reconstruct question number label
    question_num_str = (cur_stage + 1).toString();
    question_num_str = question_num_str.concat(" / ");
    question_num_str = question_num_str.concat(stages.length.toString());
    question_num_label = ex.createParagraph(s_margin, text_height + s_margin,
      question_num_str, {
      size: "medium"
    });
  }

  //Go to the next stage of exercise
  function to_next_stage() {
    if (cur_step == (stages.length - 1)) {
      return;
    }
    remove_btn(ans_button1);
    remove_btn(ans_button2);
    next_stage_btn.remove();
    ex.graphics.ctx.clearRect(0, 0, ex.width(), ex.height());
    for (var i = 0; i < codes.length; i++) {
      codes[i].remove();
    }
    cur_code_vals = [];
    code_level = 0;
    cur_step = 0;
    cur_code = "";
    codes = [];
    code_hist = [];
    code_val_hist = [];
    cur_stage++;
    //Initialize the question
    init_question();
  }

  //Take in two operands and an operator, returns the result of the operation
  function get_result(left, right, operator) {
    if (operator == "or") {
      if (left == "T") {
        return "L";
      }
      return "R";
    }
    //If the operator is "and"
    if (left == "F") {
      return "L";
    }
    return "R";
  }

  //Check if user selects the correct answer from drop down
  function check_answer() {
    if (correct_op_index == undefined) {
      console.log("Application error");
      return;
    }
    if (correct_op_index == chosen_op_index) {
      ex.alert("Correct", {color: "green"});
      to_next_step();
    }else {
      if (!not_on_server && ex.data.content.score != undefined) {
        ex.data.content.score -= 0.02;
      }
      ex.showFeedback(generate_feedback());
    }
    save_state();
  }

  //@TODO
  //Generate feedback according to error user makes
  function generate_feedback() {
    var feedback="Incorrect";
    //because cur_step was incremented
    current_stage=cur_step-1;
    switch ((current_stage)) {
        case 0:
          feedback= "Incorrect. Expressions are evaluated from left to right, and expressions inside paranthesis are evaluated first.";
          break;
        case 1:
          var correct_option=0;
          var peak_form = get_peak_format(cur_code);
          var left_right = get_left_right(peak_form);
          var correct_option = 0;
          //If the first operand is not truthy
          if (left_right[0] != "T") {
            correct_option = 1;
          }
          if(correct_option==0){
            //checks if integer
            if(!isNaN(cur_code_vals[0])){
              var text=" Integers other than 0 are truthy in Python.";
            }else{
              var text=cur_code_vals[0].concat(" is truthy in Python.")
            }
            feedback="Incorrect. ".concat(text);
          }
          else{
            if(isNaN(cur_code_vals[0])){
              var text=" None and empty structures are falsey in Python.";
            }
            else{
              var text= cur_code_vals[0].concat(" is falsey in Python.");
            }
            feedback="Incorrect. ".concat(text);
          }
          break;
        case 2:
          var ins = "Is there short-circuit evaluation in ";
          ins = ins.concat(get_peak_str(cur_code).concat("?"));
          var peak_form = get_peak_format(cur_code);
          var op_index = find_op(peak_form);
          var left = peak_form.substring(1, op_index - 1);
          var right = find_next_exp(peak_form, op_index);
          var is_short_circuit = false;
          var operator = "or";
          if (peak_form[op_index] == "a") {
            operator = "and";
          }
          if (get_result(left, right, operator) == "L") {
            is_short_circuit = true;
          }
          if (is_short_circuit) {
            //be more specific
            //the user answered that it does not short circuit
            feedback="Incorrect. Since this falls in the case where the expression short circuits (look back at truth tables), the rest of the expression is not evaluated.";
          }else {
            //be more specific
            //the user answered that it does short circuit
            feedback="Incorrect. Since this falls in the case where the expression does not short circuit (look back at truth tables), the rest of the expression must be evaluated.";
          }
          break;
        case 3:
          var peak_form = get_peak_format(cur_code);
          console.log("peak_form".concat(peak_form));
          var left_right = get_left_right(peak_form);
          console.log("get left right".concat(left_right[0]).concat(left_right[1]));
          var correct_option = 0;
          //If the second operand is falsey
          if (left_right[1] != "T") {
            correct_option = 1;
          }
          var text = "";
          if(correct_option==1){
            /*
            if(!isNaN(cur_code_vals[0])){
              var text=" Integers other than 0 are truthy in Python.";
            }else{
              var text=cur_code_vals[0].concat(" is truthy in Python.")
            }
            */
            //should be we know right?
            var text = "We can not know whether ";
            text = text.concat(get_peak_str(cur_code));
            text = text.concat(" is truthy or falsey yet");
          }
          else{
            text = "This falls in the case where it short-circuits. ";
            text = text.concat("We can already know whether ");
            text = text.concat(get_peak_str(cur_code));
            text = text.concat(" is truthy or falsey");
            /*
            if(isNaN(cur_code_vals[1])){
              var text=" None and empty structures are falsey in Python.";
            }
            else{
              var text= cur_code_vals[1].concat(" is falsey in Python.");
            }
            feedback="Incorrect. ".concat(text); */
          }
          feedback = "Incorrect. ".concat(text);
          break;
        case 4:
          var peak_str = get_peak_str(cur_code);
          var peak_form = get_peak_format(cur_code);
          var left_right = get_left_right(peak_form);
          var operator = get_op(peak_form);
          var correct_option = 0;
          //Case where the code evaluates to the value on the right
          if (get_result(left_right[0], left_right[1], operator) == "R") {
            correct_option = 1;
          }
          if(correct_option==0){
            //be more specific
            feedback="Incorrect. The expression short circuits and evaluates to the leftmost value.";
          }
          else{
            //be more specific
            feedback="Incorrect. The expression does not short circuit and evaluates to the rightmost value.";
          }
          break;
      }
      return feedback;
  }

  function draw_code(code, line) {
    var line_height = 80;
    var line_space = 5;
    var width = 240;
    var x = ex.width() / 4 - width / 2;
    var offset = 20;
    var code_well = ex.createCode(x + offset, (line_height+line_space) * line +
      line_space + question_hdr_offset, code, {
      width: width.toString().concat("px"),
      language: "python"
    });
    //Draw arrow if code level is greater than 0
    if (line > 0) {
      var ctx = ex.graphics.ctx;
      ctx.strokeStyle = "black";
      var arrow_span = 5;
      ctx.beginPath();
      var bottom_y=(line_height + line_space) * line + line_space - s_margin +
                   question_hdr_offset;
      ctx.moveTo(ex.width () / 4, bottom_y);
      ctx.lineTo(ex.width() / 4, bottom_y + s_margin - line_height / 2);
      ctx.moveTo(ex.width () / 4, bottom_y);
      ctx.lineTo(ex.width() / 4 - arrow_span, bottom_y - arrow_span);
      ctx.moveTo(ex.width () / 4, bottom_y);
      ctx.lineTo(ex.width() / 4 + arrow_span, bottom_y - arrow_span);
      ctx.stroke();
    }
    codes.push(code_well);
  }

  function draw_instruction(text) {
    if (instruction != undefined) {
      instruction.remove();
    }
    var x = ex.width() / 2 + s_margin;
    instruction = ex.createParagraph(x, s_margin + question_hdr_offset, text, {
      textAlign: "left",
      size: "large",
      width: ex.width() / 2 - s_margin
    });
  }

  function draw_btn_with_vals(vals) {
    //First remove the buttons from previous questions
    if (ans_button1 != undefined) {
      ans_button1.remove();
      ans_button1 = undefined;
    }
    if (ans_button2 != undefined) {
      ans_button2.remove();
      ans_button2 = undefined;
    }
    //Draw new buttons
    var btn_y = 80;
    ans_button1 = ex.createButton(ex.width() / 2 + s_margin, btn_y +
      question_hdr_offset, vals[0], {
      width: btn_width.toString(),
      color: "blue"
    });
    ans_button1.on("click", function(){chosen_op_index = 0; check_answer();});
    ans_button2 = ex.createButton(ex.width() / 2 + btn_width * 2,
                    btn_y + question_hdr_offset, vals[1], {
      width: btn_width.toString(),
      color: "blue"
    });
    ans_button2.on("click", function(){chosen_op_index= 1; check_answer();});
  }

  function draw_choice_btn() {
    if (drop_down != undefined) {
      drop_down.remove();
    }
    var drop_y = 40;
    if (question_type == 1) {
      switch (cur_step) {
        case 0:
          //Get around using variables
          var first_eval = find_peak(cur_code);
          var left = cur_code.substring(first_eval[0], first_eval[1] + 1);
          //Start search for the next expression at index of an operator
          var second_eval = find_next_exp(cur_code, first_eval[1] + 2);
          var right = cur_code.substring(second_eval[0], second_eval[1] + 1);
          var left_right_val = format_code([left, right]);
          draw_btn_with_vals(left_right_val);
          chosen_op_index = 0;
          break;
        case 1:
          draw_btn_with_vals(["Truthy", "Falsey"]);
          chosen_op_index = 1;
          break;
        case 2:
          draw_btn_with_vals(["Yes", "No"]);
          chosen_op_index = 1;
          break;
        case 3:
          draw_btn_with_vals(["Truthy", "Falsey"]);
          chosen_op_index = 0;
          break;
        case 4:
          var peak_form = get_peak_format(cur_code);
          var op_index = find_op(peak_form);
          var left = peak_form.substring(1, op_index - 1);
          var right_indices = find_next_exp(peak_form, op_index);
          var right = peak_form.substring(right_indices[0], right_indices[1]+1);
          var vals = format_code([left, right]);
          draw_btn_with_vals(vals);
          chosen_op_index = 1;
          break;
        default:
          break;
      }
    }
  }

  //Draw the button that user clicks to submit their answer
  function draw_submit_ans_button() {
    var button_y = 80;
    submit_ans_button = ex.createButton(ex.width() / 2 + s_margin, button_y,
      "Submit", {
      color: "lightBlue",
      size: "medium"
    });
    submit_ans_button.on("click", function(){check_answer();});
  }

  //Draw the next button that allows users go the next question
  function draw_next_btn() {
    var btn_y = 80;
    var btn_width = 150;
    next_stage_btn = ex.createButton(ex.width() / 2 + s_margin,
                     btn_y + question_hdr_offset, "Go to next question", {
      width: btn_width.toString(),
      color: "blue"
    });
    next_stage_btn.on("click", function(){to_next_stage()});
  }

  //Draw question, which includes instruction, drop down and submit button
  function draw_question(type) {
    if (type == "nextEval") {
      draw_instruction("Which expression is evaluated next?");
      draw_choice_btn();
      draw_submit_ans_button();
    }
  }

  //Draw the label of current question
  function draw_question_num() {
    var text_height = 20;
    var text_width = 100;
    question_hdr = ex.createParagraph(s_margin, s_margin, "Question", {
      size: "medium",
      height: text_height
    });
    question_num_str = (cur_stage + 1).toString();
    question_num_str = question_num_str.concat(" / ");
    question_num_str = question_num_str.concat(stages.length.toString());
    question_num_label = ex.createParagraph(s_margin, text_height + s_margin,
      question_num_str, {
      size: "medium"
    });
  }

  //Submit final result
  function submit_task() {
    if (ex.data.content.score != undefined){
      var feedBack = "Congratulations, you have finished the task. ";
      feedBack = feedBack.concat("Your score: ");
      feedBack = feedBack.concat(ex.data.content.score.toFixed(2).toString());
      feedBack = feedBack.concat(" / 1.0");
      ex.showFeedback(feedBack);
      ex.setGrade(ex.data.content.score, feedBack);
    }
    submitted = true;
    ex.chromeElements.displayCAButton.disable();
    save_state();
  }

  //@Should be changed so that the initial question is about truth table
  function initialize() {
    draw_truth_tables("or", (ex.width()/2) - 200, (ex.height()/2) - 120);
    draw_truth_tables("and", (ex.width()/2)+50, (ex.height()/2)-120);
    if (!not_on_server) {
      ex.data.content.score = 1.0;
    }
    ex.chromeElements.undoButton.disable();
    ex.chromeElements.redoButton.disable();
    ex.chromeElements.resetButton.disable();
    ex.chromeElements.submitButton.disable();
    next = ex.createButton(ex.width()-50,ex.height()-50,"next",
            {size:"small",color:"blue"}).on("click", function(){
                remove_truth_table();
                next.remove();
                draw_question_num();
                var format = get_format();
                generate_code(format);
                draw_code(format_code([format])[0], 0);
                to_next_step();
                //draw_submit_ans_button();
                in_truth_table = false;
                if (ins_alert != undefined) {
                  ins_alert.remove();
                  ins_alert = undefined;
                }
                save_state();
                next.remove();
            });
    //make sure that there is saved state
    if (!not_on_server && ex.data.instance.state.score != undefined) {
      recover_state();
    }
  }

  // is_balanced (for debugging and correctness of code)
  // Takes a format string
  // Returns true if the string is balanced
  function is_balanced(format){
    var temp_height = 0;
    for (var i = 0; i < format.length; i++) {
      if (temp_height < 0){
        return false;
      }
      switch(format[i]){
        case "(":
          temp_height ++;
          break;
        case ")":
          temp_height --;
        default:
          break;
      }
    }
    return (temp_height == 0);
  }

  // height: measure the "height: of the format string
  // Takes a balanced format string
  // Returns the height (number of "(") in string
  function height(format){
    if (!is_balanced(format)){
      // For correctness of the rest of the code
      ex.alert("Error: Imbalanced Format");
      return;
    }
    var result = 0;
    for (var i = 0; i < format.length; i++) {
      if (format[i] == "("){
        result ++;
      }
    }
    return result;
  }

  // find_peak: evaluates to the start and end of the "highest" expression
  // Takes a balanced format stirng that has at least height 1
  // Returns the start and end of the "highest" expression
  function find_peak(format){
    if (height(format) < 1) {
      ex.alert("Error: Base case format in find_peak");
      return format;
    }
    var end = 0;
    var start = 0;
    var max_height = height(format);
    var left_count = 0;
    for (var i = 0; i < format.length; i++) {
      switch(format[i]){
      // Notice the different order in the two cases
        case "(":
          left_count++;
          start = i;
          break;
        case ")":
          end = i;
          // Return immediately to ensure leftmost
          return [start, end];
        case " ":
          if (left_count == 1) {
            return [start + 1, i - 1];
          }
          break;
        default:
          break;
      }
    }
    // This line should never be reached
    ex.alert("Error: Error occured in find_peak");
    return [0, 0];
  }

  // format_to_bool: converts format to boolean
  // Takes a balanced format stirng with height 0 and no boolean operators
  // Returns the boolean value of the expression
  function format_to_bool(format){
    if (height(format) >= 1){
      ex.alert("Error: Recursive case format in format_to_bool");
      return undefined;
    }
    if (format.search("T") != -1){
        return true;
      }else if (format.search("F" != -1)){
        return false;
      }
      // By design, all undefined should be in second argument of short circuit.
      return undefined;
  }

  // bool_to_format: converts boolean to format
  // Takes a boolean value
  // Returns the format string of the value
  function bool_to_format(bool){
    if (bool){
      return "T";
    }else{
      return "F";
    }
  }

  // eval: performs one step of evaluation.
  // Takes a balanced format string like "((T or F) or E)""
  // Returns a string that is evluated "T or E"
  // eval would be much simpler if format were a tree datatype!!! *_*
  function eval(format){
    var prefix, suffix, result;
    if (!is_balanced(format)){
      // For correctness of the rest of the code
      ex.alert("Error: Imbalanced Format");
      return;
    }else if (height(format) == 0){
      // Base Case of eval
      var prefix, suffix;
      if (format.search("or") != -1){
        var index = format.search("or");
        prefix = format.substring(0, index);
        suffix = format.substring(index + 2, format.length + 1);
        result = format_to_bool(prefix) || format_to_bool(suffix);
        return bool_to_format(result);
      }else if (format.search("and" != -1)){
        var index = format.search("and");
        prefix = format.substring(0, index);
        suffix = format.substring(index + 3, format.length + 1);
        result = format_to_bool(prefix) && format_to_bool(suffix);
        return bool_to_format(result);
      }
      // To expand the interface, add operators ABOVE this line

    }else{
      // Recursive Case of eval
      var start, end;
      var peak = find_peak(format);
      start = peak[0];
      end = peak[1];
      // Removing the parenthesis during slicing
      prefix = format.substring(0, start);
      var partial_result = eval(format.substring(start+1, end));
      suffix = format.substring(end+1, format.length + 1);
      result = prefix + partial_result + suffix;
      return result; // Replace double space with single space
    }
  }

  //Recover from saved state
  function recover_state() {
    if (ex.data.instance.state.score == undefined) {
      return;
    }
    var stored_state = ex.data.instance.state;
    cur_stage = stored_state.cur_stage;
    cur_step = stored_state.cur_step;
    cur_code = stored_state.cur_code;
    code_level = stored_state.code_level;
    cur_code_vals = stored_state.cur_code_vals;
    code_hist = stored_state.code_hist;
    code_val_hist = stored_state.code_val_hist;
    correct_op_index = stored_state.correct_op_index;
    ex.data.content.score = stored_state.score;
    in_truth_table = stored_state.in_truth_table;
    ins_str = stored_state.instruction;
    task_finished = stored_state.task_finished;
    submitted = stored_state.submitted
    if (!in_truth_table) {
      remove_truth_table();
      if (ins_alert != undefined) {
        ins_alert.remove();
        ins_alert = undefined;
      }
      next.remove();
    }
    //Compensate for offset in save state
    if (!is_finished(cur_code)) {
      cur_step--;
      if (cur_step < 0) {
        cur_step = 4;
      }
    }else if (!task_finished){
      draw_next_btn();
    }else if (!submitted) {
      ex.chromeElements.submitButton.enable();
    }
    draw_choice_btn();
    cur_step++;
    draw_instruction(ins_str);
    draw_question_num();
    for (var i = 0; i <= code_level; i++) {
      var temp = cur_code_vals;
      cur_code_vals = code_val_hist[i];
      var code_w_val = format_code([code_hist[i]]);
      //restore cur_code_vals
      cur_code_vals = temp;
      draw_code(code_w_val[0], i);
    }
  }

  //Save current state
  function save_state() {
    var cur_state = {
      "cur_stage": cur_stage,
      "cur_step": cur_step,
      "cur_code": cur_code,
      "code_hist": code_hist,
      "code_val_hist": code_val_hist,
      "code_level": code_level,
      "cur_code_vals": cur_code_vals,
      "score": ex.data.content.score,
      "in_truth_table": in_truth_table,
      "correct_op_index": correct_op_index,
      "instruction": ins_str,
      "task_finished": task_finished,
      "submitted": submitted
    };
    if (!not_on_server) {
      ex.saveState(cur_state);
    }
  }

  initialize();

}
