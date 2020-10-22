import {createElement, Component, render} from "./toy-react.js";

class MyComponent extends Component {

  constructor () {
    super();
    this.state = {
      a:1,
      b:2
    }
  }

  render () {
    return <div>
      <h1>my component</h1>
      <button onclick={()=>{ this.setState({a:this.state.a + 1}) }}>add</button>
      <span>{this.state.a.toString()}</span>
      <span>{this.state.b.toString()}</span>
      {/* {this.children} */}
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
