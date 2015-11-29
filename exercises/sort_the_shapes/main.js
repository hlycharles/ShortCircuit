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
    var a_options=["A", "T", "T", "F", "F"];
    var b_options=["B", "T", "F", "T", "F"];
    var or_result=["A or B", "T", "T", "T", "F"];
    var and_result=["A and B", "T", "F", "F", "F"];
    // For possible future implementation of De Morgan's Law
    var nand = ["not (A and B)", "F", "T", "T", "T"]
    var nand_equiv=["(not A) or (not B)", "F", "T", "T", "T"]
    var nor = ["not (A or B)","F", "F", "F", "T"]
    var nor_equiv=["(not A) and (not B)", "F", "F", "F", "T"]


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
      //draw text
      for(var j=0; j<3; j++){
        if(j==0){
          curCol=a_options;
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
    cur_code = result;
    cur_code_vals = result_arr;
    correct_op_index = 0;
    return;
  }

  //Substitude values in cur_code_vals into format
  //e.g. if cur_code_vals = ["1", "0"], then
  //  format_code("(T and F)") returns "(1 and 0)"
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

  function next_stage_wrapper(ins, correct_op) {
    draw_instruction(ins);
    cur_stage++;
    draw_drop_down();
    correct_op_index = correct_op;
  }

  //Proceed to the next stage of exercise
  function to_next_stage() {
    if (question_type == 1) {
      switch ((cur_stage)) {
        case 0:
          next_stage_wrapper("Is this value truthy or falsey?", 0);
          break;
        case 1:
          next_stage_wrapper("Does short-circuit evaluation occur?", 0);
          break;
        case 2:
          cur_code_vals.splice(1, 1);
          format_code("T or E");
          draw_code(cur_code, 1);
          next_stage_wrapper("Which expression is evaluated next?", 0);
          break;
        case 3:
          next_stage_wrapper("Is this value truthy or falsy?", 0);
          break;
        case 4:
          next_stage_wrapper("Does short-circuit evaluation occur?", 0);
          break;
        case 5:
          cur_code_vals.splice(1, 1);
          format_code("T");
          draw_code(cur_code, 2);
          draw_instruction("Congratulations, you have completed this exercies");
          //Clear other UI elements
          drop_down.remove();
          drop_down = undefined;
          submit_ans_button.remove();
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
    var x = 10;
    var line_height = 80;
    var line_space = 5;
    var code_well = ex.createCode(x, (line_height + line_space) * line +
      line_space, code, {
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
          var elems = {};
          elems[cur_code_vals[0]] = function() {chosen_op_index = 0};
          elems[cur_code_vals[1]] = function() {chosen_op_index = 1};
          draw_dropdown_w_op(cur_code_vals[0], elems);
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
          elems[cur_code_vals[0]] = function() {chosen_op_index = 0};
          elems[cur_code_vals[1]] = function() {chosen_op_index = 1};
          draw_dropdown_w_op(cur_code_vals[1], elems);
          chosen_op_index = 1;
          break;
        case 4:
          var elems = {};
          elems["Truthy"] = function(){chosen_op_index = 0};
          elems["Falsey"] = function(){chosen_op_index = 1};
          draw_dropdown_w_op("Truthy", elems);
          chosen_op_index = 0;
          break;
        case 5:
          var elems = {};
          elems["Yes"] = function() {chosen_op_index = 0};
          elems["No"] = function() {chosen_op_index = 1};
          draw_dropdown_w_op("Yes", elems);
          chosen_op_index = 0;
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
                generate_code("((T or F) or E)");
                draw_code(cur_code, 0);
                draw_question("nextEval");
                next.remove();
            });
  }

  // The partial evaluation function that performs one step of evaluation.
  // Takes a string like "((T or F) or E)""
  // Returns a string that is evluated "T or E"
  function eval(format){
    return format;
  }

  initialize();

}
