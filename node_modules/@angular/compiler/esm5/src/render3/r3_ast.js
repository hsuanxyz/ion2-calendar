/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
var Text = /** @class */ (function () {
    function Text(value, sourceSpan) {
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    Text.prototype.visit = function (visitor) { return visitor.visitText(this); };
    return Text;
}());
export { Text };
var BoundText = /** @class */ (function () {
    function BoundText(value, sourceSpan, i18n) {
        this.value = value;
        this.sourceSpan = sourceSpan;
        this.i18n = i18n;
    }
    BoundText.prototype.visit = function (visitor) { return visitor.visitBoundText(this); };
    return BoundText;
}());
export { BoundText };
var TextAttribute = /** @class */ (function () {
    function TextAttribute(name, value, sourceSpan, valueSpan, i18n) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
        this.valueSpan = valueSpan;
        this.i18n = i18n;
    }
    TextAttribute.prototype.visit = function (visitor) { return visitor.visitTextAttribute(this); };
    return TextAttribute;
}());
export { TextAttribute };
var BoundAttribute = /** @class */ (function () {
    function BoundAttribute(name, type, securityContext, value, unit, sourceSpan, i18n) {
        this.name = name;
        this.type = type;
        this.securityContext = securityContext;
        this.value = value;
        this.unit = unit;
        this.sourceSpan = sourceSpan;
        this.i18n = i18n;
    }
    BoundAttribute.fromBoundElementProperty = function (prop, i18n) {
        return new BoundAttribute(prop.name, prop.type, prop.securityContext, prop.value, prop.unit, prop.sourceSpan, i18n);
    };
    BoundAttribute.prototype.visit = function (visitor) { return visitor.visitBoundAttribute(this); };
    return BoundAttribute;
}());
export { BoundAttribute };
var BoundEvent = /** @class */ (function () {
    function BoundEvent(name, handler, target, phase, sourceSpan) {
        this.name = name;
        this.handler = handler;
        this.target = target;
        this.phase = phase;
        this.sourceSpan = sourceSpan;
    }
    BoundEvent.fromParsedEvent = function (event) {
        var target = event.type === 0 /* Regular */ ? event.targetOrPhase : null;
        var phase = event.type === 1 /* Animation */ ? event.targetOrPhase : null;
        return new BoundEvent(event.name, event.handler, target, phase, event.sourceSpan);
    };
    BoundEvent.prototype.visit = function (visitor) { return visitor.visitBoundEvent(this); };
    return BoundEvent;
}());
export { BoundEvent };
var Element = /** @class */ (function () {
    function Element(name, attributes, inputs, outputs, children, references, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
        this.name = name;
        this.attributes = attributes;
        this.inputs = inputs;
        this.outputs = outputs;
        this.children = children;
        this.references = references;
        this.sourceSpan = sourceSpan;
        this.startSourceSpan = startSourceSpan;
        this.endSourceSpan = endSourceSpan;
        this.i18n = i18n;
    }
    Element.prototype.visit = function (visitor) { return visitor.visitElement(this); };
    return Element;
}());
export { Element };
var Template = /** @class */ (function () {
    function Template(attributes, inputs, outputs, children, references, variables, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
        this.attributes = attributes;
        this.inputs = inputs;
        this.outputs = outputs;
        this.children = children;
        this.references = references;
        this.variables = variables;
        this.sourceSpan = sourceSpan;
        this.startSourceSpan = startSourceSpan;
        this.endSourceSpan = endSourceSpan;
        this.i18n = i18n;
    }
    Template.prototype.visit = function (visitor) { return visitor.visitTemplate(this); };
    return Template;
}());
export { Template };
var Content = /** @class */ (function () {
    function Content(selectorIndex, attributes, sourceSpan, i18n) {
        this.selectorIndex = selectorIndex;
        this.attributes = attributes;
        this.sourceSpan = sourceSpan;
        this.i18n = i18n;
    }
    Content.prototype.visit = function (visitor) { return visitor.visitContent(this); };
    return Content;
}());
export { Content };
var Variable = /** @class */ (function () {
    function Variable(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    Variable.prototype.visit = function (visitor) { return visitor.visitVariable(this); };
    return Variable;
}());
export { Variable };
var Reference = /** @class */ (function () {
    function Reference(name, value, sourceSpan) {
        this.name = name;
        this.value = value;
        this.sourceSpan = sourceSpan;
    }
    Reference.prototype.visit = function (visitor) { return visitor.visitReference(this); };
    return Reference;
}());
export { Reference };
var Icu = /** @class */ (function () {
    function Icu(vars, placeholders, sourceSpan, i18n) {
        this.vars = vars;
        this.placeholders = placeholders;
        this.sourceSpan = sourceSpan;
        this.i18n = i18n;
    }
    Icu.prototype.visit = function (visitor) { return visitor.visitIcu(this); };
    return Icu;
}());
export { Icu };
var NullVisitor = /** @class */ (function () {
    function NullVisitor() {
    }
    NullVisitor.prototype.visitElement = function (element) { };
    NullVisitor.prototype.visitTemplate = function (template) { };
    NullVisitor.prototype.visitContent = function (content) { };
    NullVisitor.prototype.visitVariable = function (variable) { };
    NullVisitor.prototype.visitReference = function (reference) { };
    NullVisitor.prototype.visitTextAttribute = function (attribute) { };
    NullVisitor.prototype.visitBoundAttribute = function (attribute) { };
    NullVisitor.prototype.visitBoundEvent = function (attribute) { };
    NullVisitor.prototype.visitText = function (text) { };
    NullVisitor.prototype.visitBoundText = function (text) { };
    NullVisitor.prototype.visitIcu = function (icu) { };
    return NullVisitor;
}());
export { NullVisitor };
var RecursiveVisitor = /** @class */ (function () {
    function RecursiveVisitor() {
    }
    RecursiveVisitor.prototype.visitElement = function (element) {
        visitAll(this, element.attributes);
        visitAll(this, element.children);
        visitAll(this, element.references);
    };
    RecursiveVisitor.prototype.visitTemplate = function (template) {
        visitAll(this, template.attributes);
        visitAll(this, template.children);
        visitAll(this, template.references);
        visitAll(this, template.variables);
    };
    RecursiveVisitor.prototype.visitContent = function (content) { };
    RecursiveVisitor.prototype.visitVariable = function (variable) { };
    RecursiveVisitor.prototype.visitReference = function (reference) { };
    RecursiveVisitor.prototype.visitTextAttribute = function (attribute) { };
    RecursiveVisitor.prototype.visitBoundAttribute = function (attribute) { };
    RecursiveVisitor.prototype.visitBoundEvent = function (attribute) { };
    RecursiveVisitor.prototype.visitText = function (text) { };
    RecursiveVisitor.prototype.visitBoundText = function (text) { };
    RecursiveVisitor.prototype.visitIcu = function (icu) { };
    return RecursiveVisitor;
}());
export { RecursiveVisitor };
var TransformVisitor = /** @class */ (function () {
    function TransformVisitor() {
    }
    TransformVisitor.prototype.visitElement = function (element) {
        var newAttributes = transformAll(this, element.attributes);
        var newInputs = transformAll(this, element.inputs);
        var newOutputs = transformAll(this, element.outputs);
        var newChildren = transformAll(this, element.children);
        var newReferences = transformAll(this, element.references);
        if (newAttributes != element.attributes || newInputs != element.inputs ||
            newOutputs != element.outputs || newChildren != element.children ||
            newReferences != element.references) {
            return new Element(element.name, newAttributes, newInputs, newOutputs, newChildren, newReferences, element.sourceSpan, element.startSourceSpan, element.endSourceSpan);
        }
        return element;
    };
    TransformVisitor.prototype.visitTemplate = function (template) {
        var newAttributes = transformAll(this, template.attributes);
        var newInputs = transformAll(this, template.inputs);
        var newOutputs = transformAll(this, template.outputs);
        var newChildren = transformAll(this, template.children);
        var newReferences = transformAll(this, template.references);
        var newVariables = transformAll(this, template.variables);
        if (newAttributes != template.attributes || newInputs != template.inputs ||
            newChildren != template.children || newVariables != template.variables ||
            newReferences != template.references) {
            return new Template(newAttributes, newInputs, newOutputs, newChildren, newReferences, newVariables, template.sourceSpan, template.startSourceSpan, template.endSourceSpan);
        }
        return template;
    };
    TransformVisitor.prototype.visitContent = function (content) { return content; };
    TransformVisitor.prototype.visitVariable = function (variable) { return variable; };
    TransformVisitor.prototype.visitReference = function (reference) { return reference; };
    TransformVisitor.prototype.visitTextAttribute = function (attribute) { return attribute; };
    TransformVisitor.prototype.visitBoundAttribute = function (attribute) { return attribute; };
    TransformVisitor.prototype.visitBoundEvent = function (attribute) { return attribute; };
    TransformVisitor.prototype.visitText = function (text) { return text; };
    TransformVisitor.prototype.visitBoundText = function (text) { return text; };
    TransformVisitor.prototype.visitIcu = function (icu) { return icu; };
    return TransformVisitor;
}());
export { TransformVisitor };
export function visitAll(visitor, nodes) {
    var e_1, _a, e_2, _b;
    var result = [];
    if (visitor.visit) {
        try {
            for (var nodes_1 = tslib_1.__values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                var node = nodes_1_1.value;
                var newNode = visitor.visit(node) || node.visit(visitor);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return)) _a.call(nodes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    else {
        try {
            for (var nodes_2 = tslib_1.__values(nodes), nodes_2_1 = nodes_2.next(); !nodes_2_1.done; nodes_2_1 = nodes_2.next()) {
                var node = nodes_2_1.value;
                var newNode = node.visit(visitor);
                if (newNode) {
                    result.push(newNode);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (nodes_2_1 && !nodes_2_1.done && (_b = nodes_2.return)) _b.call(nodes_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    return result;
}
export function transformAll(visitor, nodes) {
    var e_3, _a;
    var result = [];
    var changed = false;
    try {
        for (var nodes_3 = tslib_1.__values(nodes), nodes_3_1 = nodes_3.next(); !nodes_3_1.done; nodes_3_1 = nodes_3.next()) {
            var node = nodes_3_1.value;
            var newNode = node.visit(visitor);
            if (newNode) {
                result.push(newNode);
            }
            changed = changed || newNode != node;
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (nodes_3_1 && !nodes_3_1.done && (_a = nodes_3.return)) _a.call(nodes_3);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return changed ? result : nodes;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfYXN0LmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFZSDtJQUNFLGNBQW1CLEtBQWEsRUFBUyxVQUEyQjtRQUFqRCxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7SUFBRyxDQUFDO0lBQ3hFLG9CQUFLLEdBQUwsVUFBYyxPQUF3QixJQUFZLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckYsV0FBQztBQUFELENBQUMsQUFIRCxJQUdDOztBQUVEO0lBQ0UsbUJBQW1CLEtBQVUsRUFBUyxVQUEyQixFQUFTLElBQWM7UUFBckUsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUFTLGVBQVUsR0FBVixVQUFVLENBQWlCO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBVTtJQUFHLENBQUM7SUFDNUYseUJBQUssR0FBTCxVQUFjLE9BQXdCLElBQVksT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRixnQkFBQztBQUFELENBQUMsQUFIRCxJQUdDOztBQUVEO0lBQ0UsdUJBQ1csSUFBWSxFQUFTLEtBQWEsRUFBUyxVQUEyQixFQUN0RSxTQUEyQixFQUFTLElBQWM7UUFEbEQsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFpQjtRQUN0RSxjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUFTLFNBQUksR0FBSixJQUFJLENBQVU7SUFBRyxDQUFDO0lBQ2pFLDZCQUFLLEdBQUwsVUFBYyxPQUF3QixJQUFZLE9BQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RixvQkFB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QU8sRUFBRTtvQkFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUN0QjthQUNGOzs7Ozs7Ozs7S0FDRjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxNQUFNLFVBQVUsWUFBWSxDQUN4QixPQUFzQixFQUFFLEtBQWU7O0lBQ3pDLElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7O1FBQ3BCLEtBQW1CLElBQUEsVUFBQSxpQkFBQSxLQUFLLENBQUEsNEJBQUEsK0NBQUU7WUFBckIsSUFBTSxJQUFJLGtCQUFBO1lBQ2IsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNwQyxJQUFJLE9BQU8sRUFBRTtnQkFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQWlCLENBQUMsQ0FBQzthQUNoQztZQUNELE9BQU8sR0FBRyxPQUFPLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQztTQUN0Qzs7Ozs7Ozs7O0lBQ0QsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2VjdXJpdHlDb250ZXh0fSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCB7QVNULCBCaW5kaW5nVHlwZSwgQm91bmRFbGVtZW50UHJvcGVydHksIFBhcnNlZEV2ZW50LCBQYXJzZWRFdmVudFR5cGV9IGZyb20gJy4uL2V4cHJlc3Npb25fcGFyc2VyL2FzdCc7XG5pbXBvcnQge0FTVCBhcyBJMThuQVNUfSBmcm9tICcuLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBOb2RlIHtcbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuO1xuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdDtcbn1cblxuZXhwb3J0IGNsYXNzIFRleHQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRUZXh0KHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBCb3VuZFRleHQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBBU1QsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBpMThuPzogSTE4bkFTVCkge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQgeyByZXR1cm4gdmlzaXRvci52aXNpdEJvdW5kVGV4dCh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgVGV4dEF0dHJpYnV0ZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIHZhbHVlU3Bhbj86IFBhcnNlU291cmNlU3BhbiwgcHVibGljIGkxOG4/OiBJMThuQVNUKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7IHJldHVybiB2aXNpdG9yLnZpc2l0VGV4dEF0dHJpYnV0ZSh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQm91bmRBdHRyaWJ1dGUgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdHlwZTogQmluZGluZ1R5cGUsIHB1YmxpYyBzZWN1cml0eUNvbnRleHQ6IFNlY3VyaXR5Q29udGV4dCxcbiAgICAgIHB1YmxpYyB2YWx1ZTogQVNULCBwdWJsaWMgdW5pdDogc3RyaW5nfG51bGwsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgaTE4bj86IEkxOG5BU1QpIHt9XG5cbiAgc3RhdGljIGZyb21Cb3VuZEVsZW1lbnRQcm9wZXJ0eShwcm9wOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eSwgaTE4bj86IEkxOG5BU1QpIHtcbiAgICByZXR1cm4gbmV3IEJvdW5kQXR0cmlidXRlKFxuICAgICAgICBwcm9wLm5hbWUsIHByb3AudHlwZSwgcHJvcC5zZWN1cml0eUNvbnRleHQsIHByb3AudmFsdWUsIHByb3AudW5pdCwgcHJvcC5zb3VyY2VTcGFuLCBpMThuKTtcbiAgfVxuXG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRCb3VuZEF0dHJpYnV0ZSh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgQm91bmRFdmVudCBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBoYW5kbGVyOiBBU1QsIHB1YmxpYyB0YXJnZXQ6IHN0cmluZ3xudWxsLFxuICAgICAgcHVibGljIHBoYXNlOiBzdHJpbmd8bnVsbCwgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cblxuICBzdGF0aWMgZnJvbVBhcnNlZEV2ZW50KGV2ZW50OiBQYXJzZWRFdmVudCkge1xuICAgIGNvbnN0IHRhcmdldDogc3RyaW5nfG51bGwgPSBldmVudC50eXBlID09PSBQYXJzZWRFdmVudFR5cGUuUmVndWxhciA/IGV2ZW50LnRhcmdldE9yUGhhc2UgOiBudWxsO1xuICAgIGNvbnN0IHBoYXNlOiBzdHJpbmd8bnVsbCA9XG4gICAgICAgIGV2ZW50LnR5cGUgPT09IFBhcnNlZEV2ZW50VHlwZS5BbmltYXRpb24gPyBldmVudC50YXJnZXRPclBoYXNlIDogbnVsbDtcbiAgICByZXR1cm4gbmV3IEJvdW5kRXZlbnQoZXZlbnQubmFtZSwgZXZlbnQuaGFuZGxlciwgdGFyZ2V0LCBwaGFzZSwgZXZlbnQuc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7IHJldHVybiB2aXNpdG9yLnZpc2l0Qm91bmRFdmVudCh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudCBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBhdHRyaWJ1dGVzOiBUZXh0QXR0cmlidXRlW10sIHB1YmxpYyBpbnB1dHM6IEJvdW5kQXR0cmlidXRlW10sXG4gICAgICBwdWJsaWMgb3V0cHV0czogQm91bmRFdmVudFtdLCBwdWJsaWMgY2hpbGRyZW46IE5vZGVbXSwgcHVibGljIHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLFxuICAgICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbiwgcHVibGljIHN0YXJ0U291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsXG4gICAgICBwdWJsaWMgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHB1YmxpYyBpMThuPzogSTE4bkFTVCkge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQgeyByZXR1cm4gdmlzaXRvci52aXNpdEVsZW1lbnQodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGF0dHJpYnV0ZXM6IFRleHRBdHRyaWJ1dGVbXSwgcHVibGljIGlucHV0czogQm91bmRBdHRyaWJ1dGVbXSxcbiAgICAgIHB1YmxpYyBvdXRwdXRzOiBCb3VuZEV2ZW50W10sIHB1YmxpYyBjaGlsZHJlbjogTm9kZVtdLCBwdWJsaWMgcmVmZXJlbmNlczogUmVmZXJlbmNlW10sXG4gICAgICBwdWJsaWMgdmFyaWFibGVzOiBWYXJpYWJsZVtdLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIHN0YXJ0U291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHB1YmxpYyBlbmRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCxcbiAgICAgIHB1YmxpYyBpMThuPzogSTE4bkFTVCkge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQgeyByZXR1cm4gdmlzaXRvci52aXNpdFRlbXBsYXRlKHRoaXMpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZW50IGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHNlbGVjdG9ySW5kZXg6IG51bWJlciwgcHVibGljIGF0dHJpYnV0ZXM6IFRleHRBdHRyaWJ1dGVbXSxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBpMThuPzogSTE4bkFTVCkge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQgeyByZXR1cm4gdmlzaXRvci52aXNpdENvbnRlbnQodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7IHJldHVybiB2aXNpdG9yLnZpc2l0VmFyaWFibGUodGhpcyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlZmVyZW5jZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQgeyByZXR1cm4gdmlzaXRvci52aXNpdFJlZmVyZW5jZSh0aGlzKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgSWN1IGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHZhcnM6IHtbbmFtZTogc3RyaW5nXTogQm91bmRUZXh0fSxcbiAgICAgIHB1YmxpYyBwbGFjZWhvbGRlcnM6IHtbbmFtZTogc3RyaW5nXTogVGV4dCB8IEJvdW5kVGV4dH0sIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgaTE4bj86IEkxOG5BU1QpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHsgcmV0dXJuIHZpc2l0b3IudmlzaXRJY3UodGhpcyk7IH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBWaXNpdG9yPFJlc3VsdCA9IGFueT4ge1xuICAvLyBSZXR1cm5pbmcgYSB0cnV0aHkgdmFsdWUgZnJvbSBgdmlzaXQoKWAgd2lsbCBwcmV2ZW50IGB2aXNpdEFsbCgpYCBmcm9tIHRoZSBjYWxsIHRvIHRoZSB0eXBlZFxuICAvLyBtZXRob2QgYW5kIHJlc3VsdCByZXR1cm5lZCB3aWxsIGJlY29tZSB0aGUgcmVzdWx0IGluY2x1ZGVkIGluIGB2aXNpdEFsbCgpYHMgcmVzdWx0IGFycmF5LlxuICB2aXNpdD8obm9kZTogTm9kZSk6IFJlc3VsdDtcblxuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IFJlc3VsdDtcbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGUpOiBSZXN1bHQ7XG4gIHZpc2l0Q29udGVudChjb250ZW50OiBDb250ZW50KTogUmVzdWx0O1xuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IFJlc3VsdDtcbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiBSZXN1bHQ7XG4gIHZpc2l0VGV4dEF0dHJpYnV0ZShhdHRyaWJ1dGU6IFRleHRBdHRyaWJ1dGUpOiBSZXN1bHQ7XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSk6IFJlc3VsdDtcbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogQm91bmRFdmVudCk6IFJlc3VsdDtcbiAgdmlzaXRUZXh0KHRleHQ6IFRleHQpOiBSZXN1bHQ7XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCk6IFJlc3VsdDtcbiAgdmlzaXRJY3UoaWN1OiBJY3UpOiBSZXN1bHQ7XG59XG5cbmV4cG9ydCBjbGFzcyBOdWxsVmlzaXRvciBpbXBsZW1lbnRzIFZpc2l0b3I8dm9pZD4ge1xuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IHZvaWQge31cbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGUpOiB2b2lkIHt9XG4gIHZpc2l0Q29udGVudChjb250ZW50OiBDb250ZW50KTogdm9pZCB7fVxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IHZvaWQge31cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiB2b2lkIHt9XG4gIHZpc2l0VGV4dEF0dHJpYnV0ZShhdHRyaWJ1dGU6IFRleHRBdHRyaWJ1dGUpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSk6IHZvaWQge31cbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogQm91bmRFdmVudCk6IHZvaWQge31cbiAgdmlzaXRUZXh0KHRleHQ6IFRleHQpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCk6IHZvaWQge31cbiAgdmlzaXRJY3UoaWN1OiBJY3UpOiB2b2lkIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN1cnNpdmVWaXNpdG9yIGltcGxlbWVudHMgVmlzaXRvcjx2b2lkPiB7XG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogdm9pZCB7XG4gICAgdmlzaXRBbGwodGhpcywgZWxlbWVudC5hdHRyaWJ1dGVzKTtcbiAgICB2aXNpdEFsbCh0aGlzLCBlbGVtZW50LmNoaWxkcmVuKTtcbiAgICB2aXNpdEFsbCh0aGlzLCBlbGVtZW50LnJlZmVyZW5jZXMpO1xuICB9XG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlKTogdm9pZCB7XG4gICAgdmlzaXRBbGwodGhpcywgdGVtcGxhdGUuYXR0cmlidXRlcyk7XG4gICAgdmlzaXRBbGwodGhpcywgdGVtcGxhdGUuY2hpbGRyZW4pO1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLnJlZmVyZW5jZXMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLnZhcmlhYmxlcyk7XG4gIH1cbiAgdmlzaXRDb250ZW50KGNvbnRlbnQ6IENvbnRlbnQpOiB2b2lkIHt9XG4gIHZpc2l0VmFyaWFibGUodmFyaWFibGU6IFZhcmlhYmxlKTogdm9pZCB7fVxuICB2aXNpdFJlZmVyZW5jZShyZWZlcmVuY2U6IFJlZmVyZW5jZSk6IHZvaWQge31cbiAgdmlzaXRUZXh0QXR0cmlidXRlKGF0dHJpYnV0ZTogVGV4dEF0dHJpYnV0ZSk6IHZvaWQge31cbiAgdmlzaXRCb3VuZEF0dHJpYnV0ZShhdHRyaWJ1dGU6IEJvdW5kQXR0cmlidXRlKTogdm9pZCB7fVxuICB2aXNpdEJvdW5kRXZlbnQoYXR0cmlidXRlOiBCb3VuZEV2ZW50KTogdm9pZCB7fVxuICB2aXNpdFRleHQodGV4dDogVGV4dCk6IHZvaWQge31cbiAgdmlzaXRCb3VuZFRleHQodGV4dDogQm91bmRUZXh0KTogdm9pZCB7fVxuICB2aXNpdEljdShpY3U6IEljdSk6IHZvaWQge31cbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybVZpc2l0b3IgaW1wbGVtZW50cyBWaXNpdG9yPE5vZGU+IHtcbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiBOb2RlIHtcbiAgICBjb25zdCBuZXdBdHRyaWJ1dGVzID0gdHJhbnNmb3JtQWxsKHRoaXMsIGVsZW1lbnQuYXR0cmlidXRlcyk7XG4gICAgY29uc3QgbmV3SW5wdXRzID0gdHJhbnNmb3JtQWxsKHRoaXMsIGVsZW1lbnQuaW5wdXRzKTtcbiAgICBjb25zdCBuZXdPdXRwdXRzID0gdHJhbnNmb3JtQWxsKHRoaXMsIGVsZW1lbnQub3V0cHV0cyk7XG4gICAgY29uc3QgbmV3Q2hpbGRyZW4gPSB0cmFuc2Zvcm1BbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbik7XG4gICAgY29uc3QgbmV3UmVmZXJlbmNlcyA9IHRyYW5zZm9ybUFsbCh0aGlzLCBlbGVtZW50LnJlZmVyZW5jZXMpO1xuICAgIGlmIChuZXdBdHRyaWJ1dGVzICE9IGVsZW1lbnQuYXR0cmlidXRlcyB8fCBuZXdJbnB1dHMgIT0gZWxlbWVudC5pbnB1dHMgfHxcbiAgICAgICAgbmV3T3V0cHV0cyAhPSBlbGVtZW50Lm91dHB1dHMgfHwgbmV3Q2hpbGRyZW4gIT0gZWxlbWVudC5jaGlsZHJlbiB8fFxuICAgICAgICBuZXdSZWZlcmVuY2VzICE9IGVsZW1lbnQucmVmZXJlbmNlcykge1xuICAgICAgcmV0dXJuIG5ldyBFbGVtZW50KFxuICAgICAgICAgIGVsZW1lbnQubmFtZSwgbmV3QXR0cmlidXRlcywgbmV3SW5wdXRzLCBuZXdPdXRwdXRzLCBuZXdDaGlsZHJlbiwgbmV3UmVmZXJlbmNlcyxcbiAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4sIGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLCBlbGVtZW50LmVuZFNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlKTogTm9kZSB7XG4gICAgY29uc3QgbmV3QXR0cmlidXRlcyA9IHRyYW5zZm9ybUFsbCh0aGlzLCB0ZW1wbGF0ZS5hdHRyaWJ1dGVzKTtcbiAgICBjb25zdCBuZXdJbnB1dHMgPSB0cmFuc2Zvcm1BbGwodGhpcywgdGVtcGxhdGUuaW5wdXRzKTtcbiAgICBjb25zdCBuZXdPdXRwdXRzID0gdHJhbnNmb3JtQWxsKHRoaXMsIHRlbXBsYXRlLm91dHB1dHMpO1xuICAgIGNvbnN0IG5ld0NoaWxkcmVuID0gdHJhbnNmb3JtQWxsKHRoaXMsIHRlbXBsYXRlLmNoaWxkcmVuKTtcbiAgICBjb25zdCBuZXdSZWZlcmVuY2VzID0gdHJhbnNmb3JtQWxsKHRoaXMsIHRlbXBsYXRlLnJlZmVyZW5jZXMpO1xuICAgIGNvbnN0IG5ld1ZhcmlhYmxlcyA9IHRyYW5zZm9ybUFsbCh0aGlzLCB0ZW1wbGF0ZS52YXJpYWJsZXMpO1xuICAgIGlmIChuZXdBdHRyaWJ1dGVzICE9IHRlbXBsYXRlLmF0dHJpYnV0ZXMgfHwgbmV3SW5wdXRzICE9IHRlbXBsYXRlLmlucHV0cyB8fFxuICAgICAgICBuZXdDaGlsZHJlbiAhPSB0ZW1wbGF0ZS5jaGlsZHJlbiB8fCBuZXdWYXJpYWJsZXMgIT0gdGVtcGxhdGUudmFyaWFibGVzIHx8XG4gICAgICAgIG5ld1JlZmVyZW5jZXMgIT0gdGVtcGxhdGUucmVmZXJlbmNlcykge1xuICAgICAgcmV0dXJuIG5ldyBUZW1wbGF0ZShcbiAgICAgICAgICBuZXdBdHRyaWJ1dGVzLCBuZXdJbnB1dHMsIG5ld091dHB1dHMsIG5ld0NoaWxkcmVuLCBuZXdSZWZlcmVuY2VzLCBuZXdWYXJpYWJsZXMsXG4gICAgICAgICAgdGVtcGxhdGUuc291cmNlU3BhbiwgdGVtcGxhdGUuc3RhcnRTb3VyY2VTcGFuLCB0ZW1wbGF0ZS5lbmRTb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9XG5cbiAgdmlzaXRDb250ZW50KGNvbnRlbnQ6IENvbnRlbnQpOiBOb2RlIHsgcmV0dXJuIGNvbnRlbnQ7IH1cblxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IE5vZGUgeyByZXR1cm4gdmFyaWFibGU7IH1cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiBOb2RlIHsgcmV0dXJuIHJlZmVyZW5jZTsgfVxuICB2aXNpdFRleHRBdHRyaWJ1dGUoYXR0cmlidXRlOiBUZXh0QXR0cmlidXRlKTogTm9kZSB7IHJldHVybiBhdHRyaWJ1dGU7IH1cbiAgdmlzaXRCb3VuZEF0dHJpYnV0ZShhdHRyaWJ1dGU6IEJvdW5kQXR0cmlidXRlKTogTm9kZSB7IHJldHVybiBhdHRyaWJ1dGU7IH1cbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogQm91bmRFdmVudCk6IE5vZGUgeyByZXR1cm4gYXR0cmlidXRlOyB9XG4gIHZpc2l0VGV4dCh0ZXh0OiBUZXh0KTogTm9kZSB7IHJldHVybiB0ZXh0OyB9XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCk6IE5vZGUgeyByZXR1cm4gdGV4dDsgfVxuICB2aXNpdEljdShpY3U6IEljdSk6IE5vZGUgeyByZXR1cm4gaWN1OyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdEFsbDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Piwgbm9kZXM6IE5vZGVbXSk6IFJlc3VsdFtdIHtcbiAgY29uc3QgcmVzdWx0OiBSZXN1bHRbXSA9IFtdO1xuICBpZiAodmlzaXRvci52aXNpdCkge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgY29uc3QgbmV3Tm9kZSA9IHZpc2l0b3IudmlzaXQobm9kZSkgfHwgbm9kZS52aXNpdCh2aXNpdG9yKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICBjb25zdCBuZXdOb2RlID0gbm9kZS52aXNpdCh2aXNpdG9yKTtcbiAgICAgIGlmIChuZXdOb2RlKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKG5ld05vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtQWxsPFJlc3VsdCBleHRlbmRzIE5vZGU+KFxuICAgIHZpc2l0b3I6IFZpc2l0b3I8Tm9kZT4sIG5vZGVzOiBSZXN1bHRbXSk6IFJlc3VsdFtdIHtcbiAgY29uc3QgcmVzdWx0OiBSZXN1bHRbXSA9IFtdO1xuICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBjb25zdCBuZXdOb2RlID0gbm9kZS52aXNpdCh2aXNpdG9yKTtcbiAgICBpZiAobmV3Tm9kZSkge1xuICAgICAgcmVzdWx0LnB1c2gobmV3Tm9kZSBhcyBSZXN1bHQpO1xuICAgIH1cbiAgICBjaGFuZ2VkID0gY2hhbmdlZCB8fCBuZXdOb2RlICE9IG5vZGU7XG4gIH1cbiAgcmV0dXJuIGNoYW5nZWQgPyByZXN1bHQgOiBub2Rlcztcbn0iXX0=