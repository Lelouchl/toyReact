const RENDER_TO_DOM = Symbol("render to dom");

export class Component {
  constructor () {
    this.props = {};
    this.children = [];
    this._root = null;
    this._range = null;
    this._vdom = {};
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

  // get vchildren () {
  //   return this.children.map(child => child.vdom);
  // }

  [RENDER_TO_DOM] (range) {
    this._range = range;
    this._vdom = this.vdom;
    this._vdom[RENDER_TO_DOM](range);
  }

  update() {

    const isSameNode = (oldNode,newNode) => {
      // type不同，直接返回false
      if (oldNode.type !== newNode.type) {
        return false;
      }
      // 比较属性不同
      for (const name in newNode.props) {
        if (newNode.props.hasOwnProperty(name)) {
          const value = newNode.props[name];
          if (value !== oldNode.props[name]) {
            return false;
          }
        }
      }
      // 旧节点属性比新节点多，返回false
      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) {
        return false;
      }
      // 比较文本节点
      if (newNode.type === "#text") {
        if (newNode.content !== oldNode.content) {
          return false;
        }
      }
      return true;
    }

    const update = (oldNode,newNode) => {
      // type, props, children
      // #text content
      if (!isSameNode(oldNode,newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range);
        return;
      }
      newNode._range = oldNode._range;

      const newChildren = newNode.vchildren;
      const oldChildren = oldNode.vchildren;

      for (let index = 0; index < newChildren.length; index++) {
        const newChild = newChildren[index];
        const oldChild = oldChildren[index];
        if (i < oldChildren.length) {
          update(oldChild,newChild);
        }else {
          // todo
        }
      }
    }

    const vdom = this.vdom;
    update(this._vdom,vdom)
    this._vdom = vdom;
  }
  // rerender() {
  //   let oldRange = this._range;

  //   let range = document.createRange();
  //   range.setStart(oldRange.startContainer,oldRange.startOffset);
  //   range.setEnd(oldRange.startContainer,oldRange.startOffset);
  //   this[RENDER_TO_DOM](range);

  //   oldRange.setStart(range.endContainer,range.endOffset);
  //   oldRange.deleteContents();
  // }

  setState(newState) {
    if (this.state === null || typeof this.state !== "object") {
      this.state = newState;
      // this.rerender();
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
    // this.rerender();
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
    this.vchildren = this.children.map(child => child.vdom);
    return this;
    // {
    //   type: this.type,
    //   props: this.props,
    //   children: this.children.map(child => child.vdom)
    // }
  }

  [RENDER_TO_DOM] (range) {
    this._range = range;

    range.deleteContents();

    const root = document.createElement(this.type);

    for (const name in this.props) {
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

    if (!this.vchildren) {
      this.vchildren = this.children.map(child => child.vdom);
    }

    for (const child of this.vchildren) {
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
    this._range = range;
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