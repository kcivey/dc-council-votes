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
  </style>
</head>
<body>
<h1>DC Council Votes</h1>

<% names = Object.keys(counts) %>
<table id="votes">
  <thead>
    <tr>
      <th></th>
      <% for (name of names) { %>
      <th class="rotate"><div><span><%- name %></span></div></th>
      <% } %>
    </tr>
  </thead>
  <tbody>
    <% for (name1 of names) { %>
      <tr>
        <th><%- name1 %></th>
        <% for (name2 of names) { %>
          <% r = counts[name1][name2] %>
          <% if (r) { %>
            <% percent = (100 * r.same / r.total) %>
            <td<%= makeStyle(percent) %> title="<%- r.same %>/<%- r.total %>"><%- Math.round(percent) %></td>
          <% } else { %>
            <td class="empty"></td>
          <% } %>
        <% } %>
      </tr>
    <% } %>
  </tbody>
</table>

<%= '\x3c%= nav %\x3e' %>
</body>
</html>
