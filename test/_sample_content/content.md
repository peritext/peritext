# Welcome

![A reference](@temporal_data){cool_timeline}


I will talk about that[^](with a footnote here) :
![Another reference](@martin_change_2002){
    layer={data=@source.data.dates,labels=@source.data.labels},
    title="My title"
}

I'm talking about a [reference](@martin_change_2002){type="short_ref"}

Now let's say I want to link to this [timeline](@temporal_data){
    type="timeline",
    layer={data=@source1.data.dates,labels=@source1.data.labels},
    layer={data=@source2.data.dates,labels=@source2.data.labels},
    caption="This is a text with {stuf} but it should work"
} and continue my paragraph quietly.

Welcome to my awesome book.

${include:thanks.md}
