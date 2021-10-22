# ea-conf-hillchart


## Quickstart

Add a hillchart to a confluence page by adding this javascript **inside of an HTML confluence macro**

```javascript
<script type="module">
import {hillChart} from "https://cdn.skypack.dev/ez-conf-hillchart";
hillChart(
	"Globally unique chart name",
	[
		"point 1",
		"point 2",
		"point 3",
		"Nifty new data point"
	]
);
</script>
```


Want to add or delete a data point from the chart?  Simply change the names passed as the second argument.

```javascript
hillChart(
	"Globally unique chart name",
	[
	  // deleted	"point 1",
        "A new data point",
		"point 2",
		"point 3",
		"Nifty new data point"
	]
);
```

Want a 2nd hill chart on the same page?  Just add a second call, being sure to use a different name as the first
argument.

```javascript
//...

hillChart(
	"Another globally unique chart name",
	[
        "A very fun task",
        "A very boring task"
	]
);
```

## Chart names *SHOULD* be globally unique.

The ```Globally unique chart name```  is used to create an attachment to the page where the chart state is saved and
should truly be globally unique.   Don't use the same name for two different hill charts.

```javascript
// "Globally unique chart name.json" attached to the page.
[... json stuff ... ]
```

Trouble occurs when fragments of one page, say the hill chart javascript code, is "transcluded" onto another page
for display.   This is more common than you might realize.  Confluence does this to create index pages and 
dashboards.

When the javascript is "transcluded" across page boundaries, it might run on a page where the json attachment
doesn't exist.  When that happens, the hill chart javascript code searches for the original attachment so that
the original state can be displayed and updated.   For this to happen properly, the attachment name needs to
be unique within confluence.

## Advanced "dot" options

THIS SECTION IS NOT YET ENABLED ON THE PUBLIC API

Want to change the color the dots on your chart?

```javascript
hillChart(
	"Another globally unique chart name",
	[
        "A very fun task",
        {
            description: "A very boring task",
            color: "red"
        }
	]
);
```

Want to make a dot linkable?

```javascript
hillChart(
	"Another globally unique chart name",
	[
        "A very fun task",
        {
            description: "A very boring task",
            color: "red",
            link: "..."
        }
	]
);
```

## Advanced state storage options

Want to explicitly control where your chart state is stored?


```javascript
import {hillChart, ConfluenceAttachment} from "https://cdn.skypack.dev/ez-conf-hillchart";
hillChart(
   "Globally unique chart name",
   [
      "point 1",
        "A new data point",
      "point 2",
      "point 3",
      "Nifty new data point"
   ],
	new ConfluenceAttachment( "spaceKey", "pageName", "attachmentName (including the .json)" )
);
```

