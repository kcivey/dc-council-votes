<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>DC Council Votes</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha256-YLGeXaapI0/5IgZopewRJcFXomhRMlYYjugPLSyNjTY=" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.1/css/all.min.css" integrity="sha256-7rF6RaSKyh16288E3hVdzQtHyzatA2MQRGu0cf6pqqM=" crossorigin="anonymous" />
  <link rel="stylesheet" href="/index.css" />
  <style type="text/css">
    th.rotate {
      height: 140px;
      white-space: nowrap;
    }
    th.rotate > div {
      transform: translate(15px, 46px) rotate(-45deg);
      width: 40px;
    }
    th.rotate > div > span {
      padding: 6px 0;
    }
    #votes td {
      text-align: right;
      width: 40px;
      height: 40px;
      padding-right: 8px;
    }
    .columns {
      border: #ccc 1px solid;
      padding: 1rem;
      columns: 2 20rem;
      max-width: 70rem;
      column-fill: balance;
      column-gap: 2rem;
    }
  </style>
</head>
<body>
<h1>DC Council Votes</h1>

<h2>How Much Do Councilmembers Agree on Votes?</h2>

<div class="columns">
<p>Since the composition of the council didn't change in the 2018 election, we've had the same members
for council periods 22 and 23 (from the beginning of 2017). I've analyzed all the votes from that period
(obtained from <a href="http://lims.dccouncil.us/api/">the Legislative Information System API</a>) to
determine how often each pair of legislators votes the same way.</p>

<p>More than 95% of the votes in the council during this time were unanimous (had no "no" votes), so I
excluded those noncontroversial votes from the analysis, leaving 128 votes. I also considered only cases
where a person voted yes or no (so not abstentions or recusals, for example). For each pair, I took the
number of times they voted the same way and divided by the number of times they were both present and
voting. The results are in the table below.</p>

<p>I also included a column with the average for each member of how often their vote agreed with each of
their colleagues. A high average might indicate members who are more cooperative or more pliant,
depending on your point of view, while a low average might mean someone is more independent or more
disagreeable. Note that the two independents (Grosso and especially Silverman) have the lowest
averages.</p>
</div>

<% names = Object.keys(counts) %>
<table id="votes">
  <thead>
    <tr>
      <th></th>
      <% for (name of names) { %>
        <th class="rotate"><div><span><%- name %></span></div></th>
      <% } %>
      <th></th>
      <th class="rotate"><div><span>Average</span></div></th>
    </tr>
  </thead>
  <tbody>
    <% for (name1 of names) { %>
      <tr>
        <th><%- name1 %></th>
        <% totalPercent = 0 %>
        <% count = 0 %>
        <% for (name2 of names) { %>
          <% r = counts[name1][name2] %>
          <% if (r) { %>
            <% percent = (100 * r.same / r.total) %>
            <% if (name1 !== name2) { %>
              <% totalPercent += percent %>
              <% count++ %>
            <% } %>
            <td<%= makeStyle(percent) %> title="<%- r.same %>/<%- r.total %>"><%- Math.round(percent) %></td>
          <% } else { %>
            <td class="empty"></td>
          <% } %>
        <% } %>
        <% avgPercent = totalPercent / count %>
        <td></td>
        <td<%= makeStyle(avgPercent) %>><%- Math.round(avgPercent) %></td>
      </tr>
    <% } %>
  </tbody>
</table>

<%= '\x3c%= nav %\x3e' %>
</body>
</html>
