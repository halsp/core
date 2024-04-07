import { Action } from "@halsp/router";
import { V } from "@halsp/validator";

export class TestDto {
  @V().Description("test-b1").Required()
  b1?: string;
  b2?: number;
}

export class ResultDto {
  @V().Description("result-b1").Required()
  b1?: string;
  @V
  b2?: number;
  @V().Deprecated()
  b3?: TestDto;
}

@V().Tags("test").Response(ResultDto)
export class ResponseBody extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Response([ResultDto])
export class ResponseArrayBody extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V()
  .Tags("test")
  .Response({
    properties: {
      p1: {
        type: "number",
        nullable: true,
      },
    },
  })
export class ResponseSchema extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Response(200, ResultDto)
export class StatusResponseBody extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Response(ResultDto).Response(200, ResultDto)
export class StatusAndDefaultResponseBody extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").ResponseDescription("desc")
export class ResponseDescription extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").ResponseDescription(200, "desc")
export class ResponseStatusDescription extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").ResponseDescription("desc").ResponseDescription(200, "desc")
export class ResponseStatusAndDefaultDescription extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V()
  .Tags("test")
  .ResponseHeaders({
    h1: {
      required: true,
    },
    h2: {
      description: "h-2",
    },
  })
export class ResponseHeaders extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V()
  .Tags("test")
  .ResponseHeaders(200, {
    h1: {
      required: true,
    },
  })
export class ResponseStatusHeaders extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V()
  .Tags("test")
  .ResponseHeaders(200, {
    h1: {
      required: true,
    },
  })
  .ResponseHeaders({
    h1: {
      required: true,
    },
    h2: {
      description: "h-2",
    },
  })
export class ResponseStatusAndDefaultHeaders extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V().Tags("test").Response(TestDto).ResponseContentTypes("mt1", "mt2")
export class ResponseContentTypes extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

@V()
  .Tags("test")
  .Response(TestDto)
  .Response(200, ResultDto)
  .ResponseContentTypes("mt1", "mt2")
export class ResponseStatusContentTypes extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}
