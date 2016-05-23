# Welcome

${toc}

![A reference](@temporal_data){@cool_timeline}

![Another view on the timeline](@temporal_data){@cool_timeline,
    startat="2012-21-01"
}


I will talk about that[^]{with a footnote here} :

![Another reference with unnamed contextualizer](@temporal_data){
    type="timeline",
    layer={layertype=events,data=@res.data.dates,labels=@res.data.labels},
    title="My title"
}


And as says [](@martin_change_2002){pages="12-13"}

And for the footnotes, I want to say that Martin said that[^]{I'm referencing to [Martin](@martin_change_2002){pages="12-13"} when he says : "hello"}

I'm talking about a [reference](@martin_change_2002).

Now let's say I want to link to this [timeline](@temporal_data){
    type="timeline",
    layer={dates=@res.data.dates,labels=@res.data.labels},
    layer={dates=@res.data.dates,labels=@res.data.labels},
    caption="This is a text with {stuf} but it should work"
} and continue my paragraph quietly.

Welcome to my awesome book.

Thanks to all !

Momanddad
The dog
My imaginary friend Serge


I am just there, not linked to ``content.md``. I should be put at the end of content by alphabetical order.


