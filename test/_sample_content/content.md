# Welcome

${toc}

![A reference](@temporal_data){@cool_timeline}



![Another view on the timeline](@temporal_data){@cool_timeline,
    startat="2012-21-01"
}

I am inline referencing to an [image](@image_test_1).

Then I want to say that the image I just showed [image](@image_test_1) is awesome.

And then I want to display a group of images :

![A group of images](@image_test_1,@image_test_2)

And then I want to point to an [online](@website_test) resource.

![This is a block website contextualization, displaying a poster or the resource (typically a screenshot) if specified](@website_test)

I will talk about that[^]{with a footnote here} :

![Another reference with unnamed contextualizer](@temporal_data){
    type="timeline",
    layer={layertype=events,data=@res.data.dates,labels=@res.data.labels},
    title="My title"
}

I will first quote in a book where someone that says [it's not possible](@ab94).
But I would like to quote again my [group of images](@image_test_1,@image_test_2).

Then I should have an ibid here [^]{[](@ab94){page="12"}.}

And as say a lot of people[^]{[](@martin_change_2002){pages="30-40"}}, publishing could be simpler.

And for the footnotes, I want to say that Martin said that[^]{I'm referencing to [](@martin_change_2002){pages="12-13"} when he says : "hello"}

Whe Martin says [there has to be some *change*](@martin_change_2002).

Now let's say I want to link to this [timeline](@temporal_data){
    type="timeline",
    layer={dates=@res.data.dates,labels=@res.data.labels},
    layer={dates=@res.data.dates,labels=@res.data.labels},
    caption="This is a text with {stuf} but it should work"
} and continue my paragraph quietly.

Welcome to my awesome book.

${include:thanks.md}
