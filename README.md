# cmsheet.js
Frontend JS library to fetch Google Sheet content and apply it to replace web page content in simple way.

Do you know that Google Sheet content can be fetched via Javascript? given that, you can actually use Google Sheet as basic content management system for your web page.

This JS library will make it easy for you to fetch GSheet content and replace content on your html pages by adding simple element attributes.

## Demo
* [JSfiddle Demo](https://jsfiddle.net/raizerde/05euaqm4/embedded/result/)
* [Simple HTML Demo](https://combinatronics.com/rizdaprasetya/cmsheet.js/master/demo/index.html) | [Alternative link](https://raw.githack.com/rizdaprasetya/cmsheet.js/master/demo/index.html) - Source: [/demo](https://github.com/rizdaprasetya/cmsheet.js/blob/master/demo/index.html)

## Usage
* Make a copy of this [GSheet](https://docs.google.com/spreadsheets/d/1BXathDx1leC5UG8FnSv-qvcDji7I0oD74Y2wX_mreY8/)
* Take a note of the GSheet ID, from the url, for example Sheet id looks like this `1BXathDx1leC5UG8FnSv-qvcDji7I0oD74Y2wX_mreY8`
* Edit the content on the sheet as you wish, publish the sheet to web, **File > Publish to The Web > Publish**
* On your web/html page add this script tag:
```html
<script src="https://cdn.jsdelivr.net/gh/rizdaprasetya/cmsheet.js@master/cmsheet.js" data-cmsheet_autorun="1" data-cmsheet_gsheet_id="YOUR_GSHEET_ID"></script> 
```
> or use your own hosted version:
```html
<script src="cmsheet.js" data-cmsheet_autorun="1" data-cmsheet_gsheet_id="YOUR_GSHEET_ID"></script> 
```
> Note: Download the cmsheet.js and edit the `src="./../cmsheet.js"` to point to where your cmsheet.js hosted.

* edit the `data-cmsheet_gsheet_id="YOUR_GSHEET_ID"` and input your GSheet ID
* add this `data-cmsheet="1"` as attribute to html element you want the content to be replaced with. E.g:
```html
<p data-cmsheet="1">this text will be replaced</p>
```
* Done! The cmsheet will auto run and replace the content of html element with that attribute

## Optional
To prevent autorun, you can set `data-cmsheet_autorun="0"` on the script tag to `0` (or remove the attribute).
And manually trigger the cmsheet with customizable options by:
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
  withGvizApi: 0
})
```
Note: all option attributes are optional. You can omit them if you want.

* You can specify which row content to use for an element by adding `data-cmsheet_row="..."` attribute:
```html
<p data-cmsheet="1" data-cmsheet_row="20"></p>
```

* You can specify/override content type to use for an element by adding `data-cmsheet_type="..."` attribute:
```html
<p data-cmsheet="1" data-cmsheet_type="html"></p>
```

##### Note:
> This readme is not complete and might be updated in the future. The `cmsheet.js` is currently basic proof of concept, not really optimized yet
