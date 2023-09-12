const app = window.require("photoshop").app;

let fgcolor = "000000";
let bgcolor = "ffffff";
let readability = 0;

var values = {
	AAsmall : false,
	AAlarge : false,
	AAAsmall : false,
	AAAlarge : false,
	readability : 0
}

function getForegroundColor() {
    return fgcolor;
}
function getBackgroundColor() {
    return bgcolor;
}

function getAASmall() {
    return values.AAsmall ? "00ff00" : "ff0000";
}
function getAALarge() {
    return values.AAlarge ? "00ff00" : "ff0000";
}
function getAAASmall() {
    return values.AAAsmall ? "00ff00" : "ff0000";
}
function getAAALarge() {
    return values.AAAlarge ? "00ff00" : "ff0000";
}
function getReadability() {
    return readability.toString();
}

function hexToRGB(hex) {
    var r = hex >> 16;
    var g = hex >> 8 & 0xFF;
    var b = hex & 0xFF;
    return [r, g, b];    
};

function getRGB(value) {
	var color_rgb = hexToRGB(parseInt(value, 16));
	var result_color = [color_rgb[0] / 255, color_rgb[1] / 255, color_rgb[2] / 255];
	return result_color;
}  


function getLuminance(ccolor) {
	var color = ccolor.replace("#","");
	var rgb = hexToRGB(parseInt(color, 16));
	var RsRGB, GsRGB, BsRGB, R, G, B;
	RsRGB = rgb[0]/255;
	GsRGB = rgb[1]/255;
	BsRGB = rgb[2]/255;

	if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
	if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
	if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
		return (0.2126 * R) + (0.7152 * G) + (0.0722 * B)
}

function validateWCAG2Parms(parms) {
	
	// return valid WCAG2 parms for isReadable.
	// If input parms are invalid, return {"level":"AA", "size":"small"}
	
	var level, size;
	parms = parms || {"level":"AA", "size":"small"};
	level = (parms.level || "AA").toUpperCase();
	size = (parms.size || "small").toLowerCase();
	
	if (level !== "AA" && level !== "AAA") {
		level = "AA";
	}
	
	if (size !== "small" && size !== "large") {
		size = "small";
	}
	
	return {"level":level, "size":size};
}

function isReadable (fgcolor, bgcolor, wcag2) {
	
  readability = (Math.max(getLuminance(fgcolor),getLuminance(bgcolor))+0.05) / (Math.min(getLuminance(fgcolor),getLuminance(bgcolor))+0.05);

  var wcag2Parms, out;
  out = false;

  wcag2Parms = validateWCAG2Parms(wcag2);
  switch (wcag2Parms.level + wcag2Parms.size) {
      case "AAsmall":
      case "AAAlarge":
          out = readability >= 4.5;
          break;
      case "AAlarge":
          out = readability >= 3;
          break;
      case "AAAsmall":
          out = readability >= 7;
          break;
  }
  return out;

};

function validateColors() 
{
  	values.AAsmall = isReadable(fgcolor, bgcolor, {level: "AA", size:"small"});
	values.AAlarge = isReadable(fgcolor, bgcolor, {level: "AA", size:"large"});
	values.AAAsmall = isReadable(fgcolor, bgcolor, {level: "AAA", size:"small"});
	values.AAAlarge = isReadable(fgcolor, bgcolor, {level: "AAA", size:"large"});
}

function validate() {
	$("#AASmall").css("background-color", "#"+getAASmall());
	$("#AALarge").css("background-color", "#"+getAALarge());
	$("#AAASmall").css("background-color", "#"+getAAASmall());
	$("#AAALarge").css("background-color", "#"+getAAALarge());
    
	let total = Math.round(getReadability());
	$("#score").html((total-1)+"/20");
}

$("#btnPopulate").on("click", function()
{
	validateColors(fgcolor,bgcolor);
	validate()
});

$("#fc").on("change", function()
{
  fgcolor = $("#fc").val();
  $("#forepicker").css("background-color",  "#"+fgcolor);
});

$("#bc").on("keyup", function()
{
  bgcolor = $("#bc").val();
  $("#backpicker").css("background-color",  "#"+bgcolor);
});

$("#information-btn").on("click", function()
{
  prompt("WCAG2", "The readability score is a number between 0 (invisible) and 20 (fully visible)\nand is an indicator of how well people can distinguish the foreground\nfrom the background.\r\nThis is not the official numbering system but indicates\nthe readability factor as well.");
});

function prompt(heading, body, buttons=["Ok"], options={title: heading, size: {width: 360, height: 280}}) {
  const [dlgEl, formEl, headingEl, dividerEl, bodyEl, footerEl] = 
      ["dialog", "form", "sp-heading", "sp-divider", "sp-body", "footer"]
      .map(tag => document.createElement(tag));
  [headingEl, dividerEl, bodyEl, footerEl].forEach(el => {
      el.style.margin="6px";
      el.style.width="calc(100% - 12px)";
  });

  formEl.setAttribute("method", "dialog");
  formEl.addEventListener("submit", () => dlgEl.close());

  footerEl.style.marginTop = "26px";

  dividerEl.setAttribute("size", "large");

  headingEl.textContent = heading;

  bodyEl.textContent = body;
  
  buttons.forEach((btnText, idx) => {
      const btnEl = document.createElement("sp-button");
      btnEl.setAttribute("variant", idx === (buttons.length - 1) ? (btnText.variant || "cta") : "secondary");
      if (idx === buttons.length - 1) btnEl.setAttribute("autofocus", "autofocus");
      if (idx < buttons.length - 1) btnEl.setAttribute("quiet");
      btnEl.textContent = (btnText.text || btnText);
      btnEl.style.marginLeft = "12px";
      btnEl.addEventListener("click", () => dlgEl.close((btnText.text || btnText)));
      footerEl.appendChild(btnEl);
  });

  [headingEl, dividerEl, bodyEl, footerEl].forEach(el => formEl.appendChild(el));
  dlgEl.appendChild(formEl);
  document.body.appendChild(dlgEl);

  return dlgEl.uxpShowModal(options);
}

validateColors(fgcolor, bgcolor);

$("#backpicker").css("background-color",  "#"+bgcolor);
$("#forepicker").css("background-color",  "#"+fgcolor);

validate();
