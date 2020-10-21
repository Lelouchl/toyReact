import {createElement, Component, render} from "./toy-react.js";

class MyComponent extends Component {
  render () {
    return <div>
      <h1>my component</h1>
      {this.children}
    </div>
  }
}

render(<MyComponent>
  <div class="abc">
    <div>a</div>
    <div>b</div>
    <div>c</div>
  </div>
</MyComponent>,document.body);
