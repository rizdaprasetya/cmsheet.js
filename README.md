# cmsheet.js
**cmsheet.js** is a simple (FrontEnd-only) JavaScript library to fetch Google Sheet content and replace web page content.

With cmsheet.js, you can use Google Sheets as a content management system for your web page. Simply add a few element attributes to your HTML pages to specify which Google Sheet content to fetch and where to display it.

cmsheet.js makes it easy to keep your web page content up-to-date without having to manually edit your HTML files.

## Demo
* [JSfiddle Demo](https://jsfiddle.net/raizerde/05euaqm4/embedded/result/)

Alternative demo urls:
* [Simple HTML Demo](https://raw.githack.com/rizdaprasetya/cmsheet.js/master/demo/index.html) | ~~[Alternative link](https://combinatronics.com/rizdaprasetya/cmsheet.js/master/demo/index.html) dead~~ - 

<small>Source file that you can refer to: [/demo/index.html](https://github.com/rizdaprasetya/cmsheet.js/blob/master/demo/index.html)</small>

## Usage
1. Make a copy of the example Google Sheet: https://docs.google.com/spreadsheets/d/1BXathDx1leC5UG8FnSv-qvcDji7I0oD74Y2wX_mreY8/ to your own Google Sheet. (Open the link, then click Google Sheet menu: **File > Make a Copy**)
2. Take note of the Google Sheet ID, which is the long string of characters in the URL of your sheet (after `/d/`). For example, the Sheet ID in the example URL is `1BXathDx1leC5UG8FnSv-qvcDji7I0oD74Y2wX_mreY8`
3. Edit the content of the sheet as you wish, then publish it to the web by going to **File > Publish to The Web > Publish**.
4. On your web page (HTML file) add this script tag:
```html
<script src="https://cdn.jsdelivr.net/gh/rizdaprasetya/cmsheet.js@master/cmsheet.js" data-cmsheet_autorun="1" data-cmsheet_gsheet_id="YOUR_GSHEET_ID"></script> 
```
> Alternatively, you can use your own hosted version of cmsheet.js:
```html
<script src="cmsheet.js" data-cmsheet_autorun="1" data-cmsheet_gsheet_id="YOUR_GSHEET_ID"></script> 
```
> Note: If you are using your own hosted version of cmsheet.js, you will need to download the file and edit the `src="./../cmsheet.js"` attribute to point to the location of the file.

5. Edit the `data-cmsheet_gsheet_id="YOUR_GSHEET_ID"` on the script tag, replace the `YOUR_GSHEET_ID` placeholder with your Google Sheet ID from step 2.
6. add this `data-cmsheet="1"` attribute to any HTML element that you want to replace with content from the Google Sheet. For example:
```html
<p data-cmsheet="1">this text will be replaced</p>
```
7. Done!

That's it! cmsheet.js will automatically run and replace the content of the HTML elements with the corresponding content from the Google Sheet.

## Optional
### Running via Javascript
To prevent autorun, you can set `data-cmsheet_autorun="0"` on the script tag to `0` (or remove the attribute).
And manually trigger the cmsheet.js via your own Javascript declaration, for example:
```javascript
cmsheet.init({
  sheetId: 'YOUR_GSHEET_ID',
  autorun: 1,
  autoapply: 1
});
```

### Parameters Options
There are several Option Object attributes that you can specify as needed. e.g.
```javascript
cmsheet.init({
  sheetId: 'YOUR_GSHEET_ID',
  autorun: 1,
  autoapply: 1,
  callback: { 
    onFinish: function(cmsheet){
      console.log('finished!',cmsheet);
    },
    onBeforeApplyEach: function(el,data){
      console.log("onBeforeApplyEach",el,data);
      return { el:el, data:data }
    },
    onAfterApplyEach: function(el,data){
      console.log("onAfterApplyEach",el,data);
      return { el:el, data:data }
    }
  },
  withGvizApi: 1
})
```
Note: all those option's attributes/params are optional. You can omit any of them if you want.

### Specify Sheet Row
You can specify which Google Sheet's row content to use for an element by adding `data-cmsheet_row="..."` attribute:
```html
<p data-cmsheet="1" data-cmsheet_row="20"></p>
```
### Specify Content Type
You can specify/override content type to use for an element by adding `data-cmsheet_type="..."` attribute:
```html
<p data-cmsheet="1" data-cmsheet_type="html"></p>
```

---

# Outro
##### Note:
> This readme is not complete and might be updated in the future. The `cmsheet.js` is currently basic proof of concept, not really optimized yet
