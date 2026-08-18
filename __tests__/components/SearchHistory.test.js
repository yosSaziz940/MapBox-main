import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchHistory from "../../components/SearchHistory";
import * as searchHistoryLib from "../../lib/searchHistory";

jest.mock("../../lib/searchHistory", () => ({
  removeFromSearchHistory: jest.fn(),
}));

describe("components/SearchHistory", () => {
  const mockHistory = ["Times Square", "Central Park", "Brooklyn Bridge"];
  const mockOnSelectAddress = jest.fn();
  const mockOnClearAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("should not render when history is empty", () => {
      const { container } = render(
        <SearchHistory
          history={[]}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render when history is null", () => {
      const { container } = render(
        <SearchHistory
          history={null}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render when history is undefined", () => {
      const { container } = render(
        <SearchHistory
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render history items when provided", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      expect(screen.getByText("Times Square")).toBeInTheDocument();
      expect(screen.getByText("Central Park")).toBeInTheDocument();
      expect(screen.getByText("Brooklyn Bridge")).toBeInTheDocument();
    });

    it("should display 'Recent Searches' header", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      expect(screen.getByText("Recent Searches")).toBeInTheDocument();
    });

    it("should display Clear button when history has items", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const clearButton = screen.getByText("Clear");
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe("user interactions", () => {
    it("should call onSelectAddress when clicking a history item", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const firstItem = screen.getByText("Times Square");
      fireEvent.click(firstItem);

      expect(mockOnSelectAddress).toHaveBeenCalledWith("Times Square");
      expect(mockOnSelectAddress).toHaveBeenCalledTimes(1);
    });

    it("should call onSelectAddress with correct address for each item", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      fireEvent.click(screen.getByText("Central Park"));
      fireEvent.click(screen.getByText("Brooklyn Bridge"));

      expect(mockOnSelectAddress).toHaveBeenNthCalledWith(
        1,
        "Central Park"
      );
      expect(mockOnSelectAddress).toHaveBeenNthCalledWith(
        2,
        "Brooklyn Bridge"
      );
    });

    it("should call onClearAll when clicking Clear button", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const clearButton = screen.getByText("Clear");
      fireEvent.click(clearButton);

      expect(mockOnClearAll).toHaveBeenCalledTimes(1);
    });

    it("should remove item from history when clicking delete (✕)", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const deleteButtons = screen.getAllByText("✕");
      fireEvent.click(deleteButtons[0]);

      expect(searchHistoryLib.removeFromSearchHistory).toHaveBeenCalledWith(
        "Times Square"
      );
    });

    it("should not trigger onSelectAddress when clicking delete button", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const deleteButtons = screen.getAllByText("✕");
      fireEvent.click(deleteButtons[1]);

      expect(mockOnSelectAddress).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have aria-label on Clear button", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const clearButton = screen.getByLabelText("Clear search history");
      expect(clearButton).toBeInTheDocument();
    });

    it("should have aria-label on delete buttons", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const deleteButtons = screen.getAllByLabelText(/Remove .+ from history/);
      expect(deleteButtons).toHaveLength(mockHistory.length);
    });

    it("should have proper button semantics for clickable items", () => {
      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("styling and CSS classes", () => {
    it("should have container with dropdown styling", () => {
      const { container } = render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const dropdown = container.querySelector(".shadow-lg");
      expect(dropdown).toBeInTheDocument();
    });

    it("should have proper z-index for overlay", () => {
      const { container } = render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const dropdown = container.querySelector(".z-10");
      expect(dropdown).toBeInTheDocument();
    });

    it("should have scrollable container with max height", () => {
      const { container } = render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const scrollContainer = container.querySelector(".max-h-60");
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe("event dispatching", () => {
    it("should dispatch search-history-updated event when item deleted", () => {
      const dispatchEventSpy = jest.spyOn(window, "dispatchEvent");

      render(
        <SearchHistory
          history={mockHistory}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      const deleteButtons = screen.getAllByText("✕");
      fireEvent.click(deleteButtons[0]);

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "search-history-updated",
        })
      );

      dispatchEventSpy.mockRestore();
    });
  });

  describe("edge cases", () => {
    it("should handle single item in history", () => {
      render(
        <SearchHistory
          history={["Single Address"]}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      expect(screen.getByText("Single Address")).toBeInTheDocument();
    });

    it("should handle very long address strings", () => {
      const longAddress =
        "123 Very Long Street Name That Goes On And On And On, City, State ZIP Code";
      render(
        <SearchHistory
          history={[longAddress]}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      expect(screen.getByText(longAddress)).toBeInTheDocument();
    });

    it("should handle addresses with special characters", () => {
      const specialAddress = "123 O'Brien St. (Downtown) - ZIP: 12345";
      render(
        <SearchHistory
          history={[specialAddress]}
          onSelectAddress={mockOnSelectAddress}
          onClearAll={mockOnClearAll}
        />
      );

      expect(screen.getByText(specialAddress)).toBeInTheDocument();
    });
  });
});
