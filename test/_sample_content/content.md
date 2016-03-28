# Welcome

![A reference](@temporal_data){cool_timeline}


I will talk about that[^]{with a footnote here} :

![Another reference](@temporal_data){
    type="timeline",
    layer={layertype=events,data=@source.data.dates,labels=@source.data.labels},
    title="My title"
}


And as says [](@martin_change_2002){pages="12-13"}

And for the footnotes, I want to say that Martin said that[^]{I'm referencing to [Martin](@martin_change_2002){pages="12-13"} when he says : "hello"}

I'm talking about a [reference](@martin_change_2002).

Now let's say I want to link to this [timeline](@temporal_data){
    type="timeline",
    layer={data=@source1.data.dates,labels=@source1.data.labels},
    layer={data=@source2.data.dates,labels=@source2.data.labels},
    caption="This is a text with {stuf} but it should work"
} and continue my paragraph quietly.

Welcome to my awesome book.

${include:thanks.md}
