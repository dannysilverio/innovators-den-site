import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message ?? "An unexpected error occurred." };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[TID ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
        }}>
          <div style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: 16,
            padding: "40px 32px",
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
          }}>
            <p style={{ color: "#FFE600", fontSize: 10, fontWeight: 700, letterSpacing: 3, marginBottom: 12 }}>
              THE INNOVATORS DEN
            </p>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 12px" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#888", fontSize: 14, margin: "0 0 28px", lineHeight: 1.6 }}>
              This page hit an unexpected error. Your data is safe — try refreshing to continue.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: "" });
                window.location.reload();
              }}
              style={{
                background: "#FFE600",
                color: "#000",
                border: "none",
                borderRadius: 10,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
