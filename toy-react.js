const RENDER_TO_DOM = Symbol("render to dom");

export class Component {
  constructor () {
    this.props = {};
    this.children = [];
    this._root = null;
    this._range = null;
  }

  setAttribute(name,value) {
    this.props[name] = value;
  }

  appendChild(component) {
    this.children.push(component);
  }

  get vdom () {
    return this.render().vdom;
  }

  get vchildren () {
    return this.children.map(child => child.vdom);
  }

  [RENDER_TO_DOM] (range) {
    this._range = range;
    this.render()[RENDER_TO_DOM](range);
  }

  rerender() {
    let oldRange = this._range;

    let range = document.createRange();
    range.setStart(oldRange.startContainer,oldRange.startOffset);
    range.setEnd(oldRange.startContainer,oldRange.startOffset);
    this[RENDER_TO_DOM](range);

    oldRange.setStart(range.endContainer,range.endOffset);
    oldRange.deleteContents();
  }

  setState(newState) {
    if (this.state === null || typeof this.state !== "object") {
      this.state = newState;
      this.rerender();
      return;
    }

    let merge = (oldState,newState) => {
      for (const key in newState) {
        if (newState.hasOwnProperty(key)) {
          const element = newState[key];
          if (oldState[key] === null || typeof oldState[key] !== "object") {
            oldState[key] = element;
          }else {
            merge(oldState[key] , element);
          }
        }
      }
    };

    merge(this.state,newState);
    this.rerender();
  }

  // get root() {
  //   if (!this._root) {
  //     this._root = this.render().root;
  //   }
  //   return this._root;
  // }
}

class ElementWarpper extends Component {
  constructor (type) {
    super(type);
    this.type = type;
    this.root = document.createElement(type);
  }

  // setAttribute(name,value) {
  //   if (name.match(/^on([\s\S]+)$/)) {
  //     this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/,c => c.toLowerCase()),value);
  //   }else {
  //     if (name === "className") {
  //       this.root.setAttribute("class",value);
  //     }else {
  //       this.root.setAttribute(name,value);
  //     }
  //   }
  // }

  // appendChild(component) {
  //   let range = document.createRange();
  //   range.setStart(this.root,this.root.childNodes.length);
  //   range.setEnd(this.root,this.root.childNodes.length);
  //   range.deleteContents();
  //   component[RENDER_TO_DOM](range);
  // }

  get vdom () {
    return this;
    // {
    //   type: this.type,
    //   props: this.props,
    //   children: this.children.map(child => child.vdom)
    // }
  }

  [RENDER_TO_DOM] (range) {
    range.deleteContents();

    const root = document.createElement(this.type);

    for (const name in this.props) {
      console.log(this.props);
      if (this.props.hasOwnProperty(name)) {
        const value = this.props[name];
            if (name.match(/^on([\s\S]+)$/)) {
              root.addEventListener(RegExp.$1.replace(/^[\s\S]/,c => c.toLowerCase()),value);
            }else {
              if (name === "className") {
                root.setAttribute("class",value);
              }else {
                root.setAttribute(name,value);
              }
            }
      }
    }

    for (const child of this.children) {
      const childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);
      childRange.deleteContents();
      child[RENDER_TO_DOM](childRange);
    }

    range.insertNode(root);
  }
}

class TextWrapper extends Component{
  constructor (content) {
    super(content);
    this.type = "#text";
    this.content = content;
    this.root = document.createTextNode(content);
  }

  get vdom () {
    return this
    // {
    //   type: "#text",
    //   content: this.content
    // }
  }

  [RENDER_TO_DOM] (range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}



export function createElement (type, attributes, ...children) {
  let e;
  if (typeof type === "string") {
    e = new ElementWarpper(type);
  }else {
    e = new type;
  }
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      const element = attributes[key];
      e.setAttribute(key,element)
    }
  }
  let insertChildren = (children) => {
    for (const child of children) {
      if (typeof child === "string") {
        child = new TextWrapper(child);
      }
      if (child === null) {
        continue;
      }
      if (typeof child === "object" && child instanceof Array) {
        insertChildren(child)
      }else {
        e.appendChild(child);
      }
    }
  }
  insertChildren(children);
  return e;
}

export function render (component, parentElement) {
  let range = document.createRange();
  range.setStart(parentElement,0);
  range.setEnd(parentElement,parentElement.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}