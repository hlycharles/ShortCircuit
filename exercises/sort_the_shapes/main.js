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

  //The current step that is evaluated
  var cur_code = "";
  //The current values that are substituted into general code format
  //  see generate_code for how it is used
  var cur_code_vals = [];
  //keep all code-wells drawn so that it will be easy to remove them
  var codes = [];
  //Current level of codes drawn
  var code_level = 0;

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

  /* paragraph elements */
  var text_list=[];

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
    var ins = "First make sure that you are familiar with the truth table. ";
    ins = ins.concat("Yellow blocks are where short-circuit happens.");
    var text = ex.createParagraph(margin, margin, ins, {
        size: "medium",
        width: ex.width()
      });
    text_list.push(text);
    var text2 = ex.createParagraph(margin, margin * 2,
      "Click 'next' to continue", {
        size: "medium"
      });
    text_list.push(text2);

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
          if((i==2 || i==3) && (type=="or")){
            ex.graphics.ctx.globalAlpha=0.4;
            ex.graphics.ctx.fillStyle="yellow";
            ex.graphics.ctx.fillRect(x+100, y+margin, 50, 50);
            ex.graphics.ctx.globalAlpha=1;
          }
          if((i==0 || i==1) && (type=="and")){
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

  //Generate a random expression that throws an exception
  function generate_exn() {
    return "(1/0)";
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
    cur_code = format;
    cur_code_vals = result_arr;
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

  function next_stage_wrapper(ins, correct_op) {
    draw_instruction (ins);
    draw_drop_down();
    correct_op_index = correct_op;
  }

  //Proceed to the next stage of exercise
  function to_next_stage() {
    if (question_type == 1) {
      switch ((cur_stage)) {
        case 0:
          var ins = "Which part of code is going to be evaluated?"
          next_stage_wrapper(ins, 0);
          cur_stage++;
          break;
        case 1:
          var peak_form = get_peak_format(cur_code);
          var left_right = get_left_right(peak_form);
          var correct_option = 0;
          //If the first operand is not truthy
          if (left_right[0] != "T") {
            correct_option = 1;
          }
          var ins = "Is ".concat(cur_code_vals[0].concat(" truthy or falsey?"));
          next_stage_wrapper(ins, correct_option);
          cur_stage++;
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
            next_stage_wrapper(ins, 0);
            //Skip the question about second argument
            cur_stage = 4;
          }else {
            next_stage_wrapper(ins, 1);
            cur_stage++;
          }
          break;
        case 3:
          var peak_form = get_peak_format(cur_code);
          console.log("peak_form".concat(peak_form));
          var left_right = get_left_right(peak_form);
          console.log("get left right".concat(left_right[0]).concat(left_right[1]));
          var correct_option = 0;
          //If the second operand is not truthy
          if (left_right[1] != "T") {
            correct_option = 1;
          }
          var ins = "Is ".concat(cur_code_vals[1].concat(" truthy or falsey?"));
          next_stage_wrapper(ins, correct_option);
          cur_stage++;
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

          ins = "What does ";
          ins = ins.concat(peak_str).concat(" evaluate to?");
          next_stage_wrapper(ins, correct_option);
          cur_stage++;
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
          if (cur_code == prev_code) {
            cur_code = eval(cur_code.substring(1, cur_code.length - 1));
          }
          var code_val = format_code([cur_code]);
          code_level++;
          draw_code(code_val[0], code_level);
          if (is_finished(cur_code)) {
            draw_instruction("Congratulations, you have completed this exercise");
            //Clear other UI elements
            drop_down.remove();
            drop_down = undefined;
            submit_ans_button.remove();
            break;
          }
          cur_stage = 0;
          to_next_stage();
          break;
        default:
          break;
      }
    }
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
    var line_height = 80;
    var line_space = 5;
    var width = 200;
    var x = ex.width() / 4 - width / 2;
    var code_well = ex.createCode(x, (line_height + line_space) * line +
      line_space, code, {
      width: width.toString().concat("px"),
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

  function draw_dropdown_w_op(defalt, options) {
    var drop_y = 40;
    drop_down = ex.createDropdown(s_margin + ex.width() / 2, drop_y, defalt, {
      color: "light-blue",
      elements: options
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
          var first_eval = find_peak(cur_code);
          var left = cur_code.substring(first_eval[0], first_eval[1] + 1);
          //Start search for the next expression at index of an operator
          var second_eval = find_next_exp(cur_code, first_eval[1] + 2);
          var right = cur_code.substring(second_eval[0], second_eval[1] + 1);
          var left_right_val = format_code([left, right]);
          var elems = {};
          elems[left_right_val[0]] = function() {chosen_op_index = 0};
          elems[left_right_val[1]] = function() {chosen_op_index = 1};
          draw_dropdown_w_op(left_right_val[0], elems);
          chosen_op_index = 0;
          break;
        case 1:
          var elems = {};
          elems["Truthy"] = function(){chosen_op_index = 0};
          elems["Falsey"] = function(){chosen_op_index = 1};
          draw_dropdown_w_op("Falsey", elems);
          chosen_op_index = 1;
          break;
        case 2:
          var elems = {};
          elems["Yes"] = function(){chosen_op_index = 0};
          elems["No"] = function(){chosen_op_index = 1};
          draw_dropdown_w_op("No", elems);
          chosen_op_index = 1;
          break;
        case 3:
          var elems = {};
          elems["Truthy"] = function(){chosen_op_index = 0};
          elems["Falsey"] = function(){chosen_op_index = 1};
          draw_dropdown_w_op("Truthy", elems);
          chosen_op_index = 0;
          break;
        case 4:
          var peak_form = get_peak_format(cur_code);
          var op_index = find_op(peak_form);
          var left = peak_form.substring(1, op_index - 1);
          var right_indices = find_next_exp(peak_form, op_index);
          var right = peak_form.substring(right_indices[0], right_indices[1]+1);
          var vals = format_code([left, right]);
          var elems = {};
          elems[vals[0]] = function() {chosen_op_index = 0};
          elems[vals[1]] = function() {chosen_op_index = 1};
          draw_dropdown_w_op(vals[1], elems);
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
    draw_truth_tables("or", (ex.width()/2) - 200, (ex.height()/2) - 150);
    draw_truth_tables("and", (ex.width()/2)+50, (ex.height()/2)-150);
    next = ex.createButton(ex.width()-50,ex.height()-50,"next",
            {size:"small",color:"blue"}).on("click", function(){
                ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
                for(var i=0; i<text_list.length; i++){
                  text_list[i].remove();
                }
                var format = "((T and F) and T)";
                generate_code(format);
                draw_code(format_code([format])[0], 0);
                to_next_stage();
                draw_submit_ans_button();
                next.remove();
            });
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

  initialize();

}
