# This is part one


I want a table for my resource there :

![My table](@temporal_data)

But I can also display the same resource as a timeline :

![A reference to a timeline should display here when timeline is ready](@temporal_data){@cool_timeline}



![Another view on the timeline](@temporal_data){@cool_timeline,
    startat="2012-21-01"
}

I am inline referencing to an [image](@image_test_1).

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus, fugit, id. Unde nulla incidunt sapiente reiciendis atque similique totam, facere earum dolores. Soluta earum, autem! Fugit, iure, repellat. Nesciunt, inventore.

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sequi necessitatibus aliquam nisi odio et perferendis reiciendis porro, fugit repellat similique consequuntur dolor perspiciatis? Laborum doloribus ducimus alias sequi sapiente! Voluptate.

Then I want to say that the [image](@image_test_1) that I showed is awesome.

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio nemo eius autem, saepe dolore nam iste ex inventore, minus neque mollitia molestias facere asperiores vel voluptas beatae esse perspiciatis cupiditate.

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolore commodi maxime laborum cupiditate nam consequuntur in. Laudantium autem, accusantium! Iure, autem quas quis, odit fugit dolor voluptatum esse quisquam asperiores.

And then I want to display a group of images :

![A group of images](@image_test_1,@image_test_2)

And then I want to point to an [online](@website_test) resource.

![This is a block *website* contextualization, displaying a poster or the resource (typically a screenshot) if specified](@website_test)

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

I'm now going to quote a book from the same authors in the same year, but different - it should add a b but let's see what's in the footnote[^]{[](@martin_change_2002b){pages="32-36"}}.

And for the footnotes, I want to say that Martin said that[^]{I'm referencing to [](@martin_change_2002){pages="12-13"} when he says : "hello"}

Whe Martin says [there has to be some *change*](@martin_change_2002).

Now let's say I want to link to this [timeline](@temporal_data){
    type="timeline",
    layer={dates=@res.data.dates,labels=@res.data.labels},
    layer={dates=@res.data.dates,labels=@res.data.labels},
    caption="This is a text with {stuf} but it should work"
} and continue my paragraph quietly.

Welcome to my awesome book.

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolor, saepe. Facere minus dolores, voluptatem quia provident dolor odit neque nihil, est commodi, suscipit eligendi, mollitia. Ratione voluptates, alias! Consequuntur, earum.

An inline resource video, it should display a thumbnail or something in static mode even if its not visible :

$$$
@video{my_interview,
    name={My interview},
    url={https://www.youtube.com/watch?v=dX3k_QDnzHE&list=RDEMKE7uLtY3Y63qMHubgnxcew&index=14}
}
$$$

I am now talking about [material things](@materiality){
alias=""
}. But I would prefer to register it as [a concept](@materiality){alias="materiality of things"}, for instance "materiality of things". Check out the glossary !.

* a first list level
    - second list level
* return to first list level
