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
    <div class="a">a</div>
    <div class="b">b</div>
    <div class="c">c</div>
  </div>
  <div class="abc">
    <div class="d">d</div>
    <div class="e">e</div>
    <div class="f">f
      <div class="g">g</div>
      <div class="h">h</div>
    </div>
  </div>

</MyComponent>,document.body);
