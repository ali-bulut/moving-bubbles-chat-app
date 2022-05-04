/**
 * This class will contain a set of functions that are related with colorize operations
 */
class ColorHelper {
  // TODO: add more colors
  static colors = ["red", "green", "blue"];

  /**
   * This helper function generates a random color.
   */
  static randomizeColor = () => {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  };
}

module.exports = ColorHelper;
