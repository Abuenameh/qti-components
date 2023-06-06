import { html } from 'lit';

export default {
  title:"styles/layout"
};

export const FixedContainer = () => html`
  <div class="container">
    <h3 style="margin-top:0;">Fixed Container, qti-layout-row, qti-layout-col</h3>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col3">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col3">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col3">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col3">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col4">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col4">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col4">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col5">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col7">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col6">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col6">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col12">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy
        dog. The quick brown fox jumped over the lazy dog.
      </div>
    </div>

    <hr />
    <br />

    <h3>Fixed Container, qti-layout-row, qti-layout-col, qti-layout-offset</h3>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col6 qti-layout-offset3">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy
        dog. The quick brown fox jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col4 qti-layout-offset2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col4">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col2 qti-layout-offset1">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col4 qti-layout-offset1">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2 qti-layout-offset1">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />
  </div>
`;

export const FluidContainer = () => html`
  <div class="container-fluid">
    <h3 style="margin-top:0;">Fluid Container, qti-layout-row, qti-layout-col</h3>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
      <div class="qti-layout-col1">The quick brown fox jumped over the lazy dog.</div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col3">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col3">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col3">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col3">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col4">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col4">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col4">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col5">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col7">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col6">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col6">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col12">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy
        dog. The quick brown fox jumped over the lazy dog.
      </div>
    </div>

    <hr />
    <br />

    <h3>Fluid Container, qti-layout-row, qti-layout-col, qti-layout-offset</h3>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col6 qti-layout-offset3">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy
        dog. The quick brown fox jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col4 qti-layout-offset2">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col4">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />

    <div class="qti-layout-row">
      <div class="qti-layout-col2 qti-layout-offset1">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col4 qti-layout-offset1">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
      <div class="qti-layout-col2 qti-layout-offset1">
        The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. The quick brown fox
        jumped over the lazy dog.
      </div>
    </div>

    <hr />
  </div>
`;
