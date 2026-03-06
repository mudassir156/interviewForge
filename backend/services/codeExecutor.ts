import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface ExecutionOptions {
  code: string;
  language: string;
  timeout?: number;
  input?: string;
}

export interface ExecutionResult {
  output: string;
  error: string | null;
  success: boolean;
  executionTime: number;
}

class CodeExecutor {
  private timeout = 10000; // 10 seconds default
  private tempDir = path.join(os.tmpdir(), 'interviewforge');

  constructor() {
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { code, language, timeout = this.timeout, input } = options;
    const startTime = Date.now();

    try {
      let result = '';

      switch (language.toLowerCase()) {
        case 'javascript':
          result = this.executeJavaScript(code, input);
          break;
        case 'python':
          result = this.executePython(code, input);
          break;
        case 'java':
          result = this.executeJava(code, input);
          break;
        case 'cpp':
          result = this.executeCpp(code, input);
          break;
        case 'go':
          result = this.executeGo(code, input);
          break;
        case 'rust':
          result = this.executeRust(code, input);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        output: result,
        error: null,
        success: true,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error('[v0] Code execution error:', errorMessage);

      return {
        output: '',
        error: errorMessage,
        success: false,
        executionTime,
      };
    }
  }

  private executeJavaScript(code: string, input?: string): string {
    const tempFile = path.join(this.tempDir, `script_${Date.now()}.js`);

    try {
      fs.writeFileSync(tempFile, code);
      const result = execSync(`node ${tempFile}`, {
        timeout: this.timeout,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      return result;
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  private executePython(code: string, input?: string): string {
    const tempFile = path.join(this.tempDir, `script_${Date.now()}.py`);

    try {
      fs.writeFileSync(tempFile, code);
      const result = execSync(`python3 ${tempFile}`, {
        timeout: this.timeout,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      return result;
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  private executeJava(code: string, input?: string): string {
    // Extract class name from code
    const classNameMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classNameMatch ? classNameMatch[1] : 'Solution';

    const tempFile = path.join(this.tempDir, `${className}_${Date.now()}.java`);

    try {
      fs.writeFileSync(tempFile, code);
      const dir = path.dirname(tempFile);

      // Compile
      execSync(`javac ${tempFile}`, {
        timeout: this.timeout,
        cwd: dir,
      });

      // Execute
      const result = execSync(`java -cp ${dir} ${className}`, {
        timeout: this.timeout,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      return result;
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      const classFile = tempFile.replace('.java', '.class');
      if (fs.existsSync(classFile)) {
        fs.unlinkSync(classFile);
      }
    }
  }

  private executeCpp(code: string, input?: string): string {
    const tempFile = path.join(this.tempDir, `script_${Date.now()}.cpp`);
    const outputFile = tempFile.replace('.cpp', '');

    try {
      fs.writeFileSync(tempFile, code);

      // Compile
      execSync(`g++ ${tempFile} -o ${outputFile}`, {
        timeout: this.timeout,
      });

      // Execute
      const result = execSync(outputFile, {
        timeout: this.timeout,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      return result;
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
    }
  }

  private executeGo(code: string, input?: string): string {
    const tempFile = path.join(this.tempDir, `script_${Date.now()}.go`);

    try {
      fs.writeFileSync(tempFile, code);
      const result = execSync(`go run ${tempFile}`, {
        timeout: this.timeout,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      return result;
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  private executeRust(code: string, input?: string): string {
    const tempFile = path.join(this.tempDir, `script_${Date.now()}.rs`);
    const outputFile = tempFile.replace('.rs', '');

    try {
      fs.writeFileSync(tempFile, code);

      // Compile
      execSync(`rustc ${tempFile} -o ${outputFile}`, {
        timeout: this.timeout,
      });

      // Execute
      const result = execSync(outputFile, {
        timeout: this.timeout,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      return result;
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
    }
  }
}

export const codeExecutor = new CodeExecutor();
